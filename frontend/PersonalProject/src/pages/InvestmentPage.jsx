import React, { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  IconButton,
  useMediaQuery,
  TextField,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import AddRemToggle from "../components/AddRemToggle";
import InvestChart from "../components/InvestChart";
import MarketPerformance from "../components/MarketPerformace";
import {
  getInvestments,
  addInvestment,
  deleteInvestment,
  updateInvestment,
} from "../investment_api";
import { getPlan } from "../retire_api";


export default function InvestmentPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const navigate = useNavigate();

  // UI mode for adding/removing
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // Investments list
  const [investments, setInvestments] = useState([]);
  const [newInvestmentName, setNewInvestmentName] = useState("");

  // Selected investment for details editing
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);

  // Chart end year
  const [chartEndYear, setChartEndYear] = useState(30);

  // Refs for layout (if you want to measure)
  const investmentsRef = useRef(null);
  const chartRef = useRef(null);
  const detailsRef = useRef(null);

  // Plan (to compute nest egg)
  const [plan, setPlan] = useState({
    current_age: "",
    retirement_age: "",
    projected_expenses: "",
    withdrawal_rate: "",
    readiness: 0,
  });

  // whether to show the retirement goal on the chart
  const [showRetirementGoal, setShowRetirementGoal] = useState(false);


  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const data = await getInvestments();
    setInvestments(data || []);
    try {
      const p = await getPlan();
      setPlan({
        current_age: p?.current_age ?? "",
        retirement_age: p?.retirement_age ?? "",
        projected_expenses: p?.projected_expenses ?? "",
        withdrawal_rate: p?.withdrawal_rate ?? "",
        readiness: typeof p?.readiness !== "undefined" && p?.readiness !== null ? Number(p.readiness) : 0,
      });
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    }
    // if selected was deleted or missing, clear selection
    if (selectedId && !(data || []).find((d) => d.id === selectedId)) {
      setSelectedId(null);
      setSelected(null);
    } else if (selectedId) {
      const fresh = (data || []).find((d) => d.id === selectedId);
      if (fresh) setSelected(fresh);
    }
  };

  // Nest egg = (projected monthly expenses × 12) / (withdrawal_rate / 100)
  const monthlyExpensesNum = Number(plan.projected_expenses) || 0;
  const withdrawalRateNum = Number(plan.withdrawal_rate) || 0;
  const nestEgg =
    withdrawalRateNum > 0 ? (monthlyExpensesNum * 12) / (withdrawalRateNum / 100) : null;

  // --- Add / Delete handlers ---
  const handleAddInvestment = async () => {
    const name = newInvestmentName.trim();
    if (!name) return;
    // create with default zeros as requested
    await addInvestment({
      investment_name: name,
      value: 0,
      rate_of_return: 0, // store as percent (0 meaning 0.00%)
      contribution: 0,
      contribution_timeline_years: 0,
    });
    setNewInvestmentName("");
    await loadAll();
  };

  const handleDeleteInvestment = async (id) => {
    await deleteInvestment(id);
    // if deleting currently selected, clear selection
    if (selectedId === id) {
      setSelectedId(null);
      setSelected(null);
    }
    await loadAll();
  };


  const handleSaveSelected = async () => {
    if (!selected || !selectedId) return;

    const original = investments.find((inv) => inv.id === selectedId);

    const fields = [
      "investment_name",
      "value",
      "rate_of_return",
      "contribution",
      "contribution_timeline_years",
    ];

    const payload = {};

    fields.forEach((f) => {
      let newVal = selected[f];

      // Normalize empty -> null/0 appropriately
      if (newVal === "" || newVal === null || typeof newVal === "undefined") {
        // For numeric fields we coerce to 0; for name we keep as empty string
        if (f === "investment_name") {
          newVal = "";
        } else if (f === "value" || f === "rate_of_return") {
          newVal = 0;
        } else {
          newVal = 0;
        }
      }

      // Parse numeric types
      if (f === "value" || f === "rate_of_return") {
        // keep as number for comparison, but send as string (safer for DecimalField)
        newVal = parseFloat(newVal) || 0;
      } else if (f === "contribution" || f === "contribution_timeline_years") {
        newVal = parseInt(newVal, 10) || 0;
      } else {
        newVal = String(newVal);
      }

      // Normalize original for comparison (if present)
      let origVal;
      if (original) {
        origVal = original[f];
        if (f === "value" || f === "rate_of_return") {
          origVal = origVal === null || typeof origVal === "undefined" ? 0 : parseFloat(origVal);
        } else if (f === "contribution" || f === "contribution_timeline_years") {
          origVal = origVal === null || typeof origVal === "undefined" ? 0 : parseInt(origVal, 10);
        } else {
          origVal = origVal === null || typeof origVal === "undefined" ? "" : String(origVal);
        }
      }

      // If original missing (new data) or changed, add to payload
      if (!original || origVal !== newVal) {
        // For DecimalFields, send as string (DRF DecimalField expects string reliably)
        if (f === "value" || f === "rate_of_return") {
          payload[f] = String(newVal);
        } else if (f === "investment_name") {
          payload[f] = newVal;
        } else {
          // integers -> send as numbers
          payload[f] = newVal;
        }
      }
    });

    if (Object.keys(payload).length === 0) {
      setSelectedId(null);
      setSelected(null);
      return;
    }

    try {
      await updateInvestment(selectedId, payload);
      await loadAll();
      setSelectedId(null);
      setSelected(null);
    } catch (err) {
      // **Detailed error logging** — inspect err.response.data in console / network
      // Axios attaches server response to err.response
      console.error("Failed updating investment:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response data (validation errors):", err.response.data);
        // Optionally show a user-friendly alert
        alert(
          "Update failed: " +
          (err.response.data && typeof err.response.data === "object"
            ? JSON.stringify(err.response.data)
            : err.response.statusText || err.message)
        );
      } else {
        alert("Update failed: " + err.message);
      }
    }
  };



  // When a list item is clicked, set selected state
  const handleSelect = (inv) => {
    setSelectedId(inv.id);
    // normalize local selected fields to strings for inputs
    setSelected({
      ...inv,
      value: inv.value ?? 0,
      contribution: inv.contribution ?? 0,
      contribution_timeline_years: inv.contribution_timeline_years ?? 0,
      rate_of_return: inv.rate_of_return ?? 0, // percent, like 9.4
    });
  };

  // Utility: render list of investments similar to NetWorthPage
  const renderList = () => (
    <>
      {investments.map((inv) => (
        <Box
          key={inv.id}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
          sx={{
            width: "100%",
            minWidth: 0,
            cursor: "pointer",
            bgcolor: selectedId === inv.id ? "action.selected" : "transparent",
            p: selectedId === inv.id ? 1 : 0,
            borderRadius: 1,
          }}
          onClick={() => handleSelect(inv)}
        >
          <Typography
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {inv.investment_name}
          </Typography>

          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              flexShrink: 0,
              whiteSpace: "nowrap",
              ml: 1,
            }}
          >
            <Typography>
              {Number(inv.rate_of_return || 0).toFixed(2)}%
            </Typography>

            {isRemoveMode && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteInvestment(inv.id);
                }}
                size="small"
                aria-label="delete"
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
    </>
  );

  const renderAddForm = () => (
    <Box
      mt={2}
      display="flex"
      gap={1}
      sx={{
        flexWrap: "wrap",
        alignItems: "center",
        width: "100%",
      }}
    >
      <TextField
        placeholder="Investment name"
        value={newInvestmentName}
        onChange={(e) => setNewInvestmentName(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: 260 },
          flexShrink: 0,
        }}
      />
      <Button
        onClick={handleAddInvestment}
        variant="contained"
        sx={{
          height: 40,
          flexShrink: 0,
        }}
      >
        Add
      </Button>
    </Box>
  );

  // Selected details inputs controlled
  const updateSelectedField = (field, value) => {
    setSelected((s) => ({ ...(s || {}), [field]: value }));
  };

  // When the "Contribute indefinitely" radio is chosen, we set contribution_timeline_years to chartEndYear
  const setContributeIndefinitely = () => {
    updateSelectedField("contribution_timeline_years", chartEndYear);
  };

  // Layout grid template
  const gridTemplateAreas = {
    xs: `
      "header"
      "market_data"
      "investments"
      "invest_chart"
      "invest_details"
      "footer"
    `,
    md: `
      "header header header"
      "market_data invest_chart invest_chart"
      "investments invest_chart invest_chart"
      "invest_details invest_details invest_details"
      "footer footer footer"
    `,
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        p: 1,
        pl: 0,
        gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
        gridTemplateAreas,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box sx={{ gridArea: "header" }}>
        <Typography variant="h4" mb={2}>
          Invest
        </Typography>
        <AddRemToggle
          isRemove={isRemoveMode}
          onClick={() => setIsRemoveMode((s) => !s)}
        />
      </Box>
      {/* Market Data */}
      <Box sx={{
        gridArea: "market_data",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "start",
        alignSelf: "start",
      }}>
        <MarketPerformance />
      </Box>

      {/* Investments list */}
      <Box sx={{
         gridArea: "investments",
         display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "start",
        alignSelf: "start", 
         }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            boxSizing: "border-box",
            width: "100%",
          }}
          ref={investmentsRef}
        >
          <Typography variant="h5" mb={2}>
            Investments
          </Typography>

          {renderList()}

          {isRemoveMode && renderAddForm()}
        </Paper>
      </Box>


      {/* Chart */}
      <Box sx={{ gridArea: "invest_chart" }}>
        <Paper elevation={3} sx={{ p: 2, boxSizing: "border-box", width: "100%" }} ref={chartRef}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Portfolio Growth</Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Chart Length (years)</Typography>
              <TextField
                type="number"
                size="small"
                value={chartEndYear}
                onChange={(e) => {
                  const v = Math.max(1, parseInt(e.target.value || 1));
                  setChartEndYear(v);
                  // if selected uses indefinite, keep selection aligned
                  if (selected && selected.contribution_timeline_years === chartEndYear) {
                    updateSelectedField("contribution_timeline_years", v);
                  }
                }}
                sx={{ width: 100 }}
              />
            </Box>
          </Box>

          <InvestChart
            investments={investments}
            endYear={chartEndYear}
            retirementGoal={nestEgg}
            showRetirementGoal={showRetirementGoal}
          />

          {/* Checkbox + Adjust link */}
          <Box display="flex" alignItems="center" justifyContent="flex-start" gap={2} mt={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showRetirementGoal}
                  onChange={(e) => setShowRetirementGoal(e.target.checked)}
                />
              }
              label="Show Retirement Goal"
            />

            <Button variant="text" onClick={() => navigate("/retire")}>
              Adjust This
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Details */}
      <Box sx={{ gridArea: "invest_details" }}>
        <Paper elevation={3} sx={{ p: 2, boxSizing: "border-box", width: "100%" }} ref={detailsRef}>
          <Typography variant="h5" mb={2}>
            Investment Details
          </Typography>

          {!selected ? (
            <Typography variant="body2" color="text.secondary">
              Select an investment from the list to view / edit its details.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={2} sx={{ width: 340 }}>
                  <TextField
                    label="Investment name"
                    value={selected.investment_name || ""}
                    onChange={(e) => updateSelectedField("investment_name", e.target.value)}
                    size="small"
                  />

                  <TextField
                    label="Current Value"
                    value={selected.value ?? 0}
                    onChange={(e) => updateSelectedField("value", e.target.value)}
                    type="number"
                    size="small"
                    slotProps={{ input: { min: 0, inputMode: "decimal" } }}
                  />

                  <TextField
                    label="Monthly Contribution"
                    value={selected.contribution ?? 0}
                    onChange={(e) => updateSelectedField("contribution", e.target.value)}
                    type="number"
                    size="small"
                    slotProps={{ input: { min: 0, inputMode: "numeric" } }}
                  />

                  <TextField
                    label="Rate of Return (%)"
                    value={selected.rate_of_return ?? 0}
                    onChange={(e) => updateSelectedField("rate_of_return", e.target.value)}
                    type="number"
                    size="small"
                    slotProps={{ input: { inputMode: "decimal" } }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Contribution timeline</FormLabel>
                    <RadioGroup
                      value={
                        Number(selected.contribution_timeline_years) === Number(chartEndYear)
                          ? "indefinite"
                          : "finite"
                      }
                      onChange={(e) => {
                        if (e.target.value === "indefinite") {
                          setContributeIndefinitely();
                        } else {
                          // finite — keep current value (do nothing)
                        }
                      }}
                      row={false}
                    >
                      <FormControlLabel
                        value="indefinite"
                        control={<Radio />}
                        label={`Contribute Indefinitely`}
                        onClick={() => {
                          setContributeIndefinitely();
                        }}
                      />

                      <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                        <FormControlLabel value="finite" control={<Radio />} label="Contribute for" />
                        <TextField
                          sx={{ width: 120 }}
                          size="small"
                          type="number"
                          value={selected.contribution_timeline_years ?? 0}
                          onChange={(e) =>
                            updateSelectedField("contribution_timeline_years", e.target.value)
                          }
                          slotProps={{ input: { min: 0, max: 100, inputMode: "numeric" } }}
                        />
                        <Typography>years</Typography>
                      </Box>
                    </RadioGroup>
                  </FormControl>

                  <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => { setSelectedId(null); setSelected(null); }}>
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSaveSelected}>
                      Save
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Box>


      {/* Footer */}
      <Box
        sx={{
          gridArea: "footer",
          display: "flex",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          mt: 0,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}
