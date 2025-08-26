import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  IconButton,
  useMediaQuery,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import AddRemToggle from "../components/AddRemToggle";
import RetirementReadiness from "../components/RetirementReadiness";
import {
  getPlan,
  updatePlan,
  getRetIncome,
  postRetIncome,
  deleteRetIncome,
  postRetIncomeBulk,
  getInflationData,
} from "../retire_api";
import { getInvestments } from "../investment_api";


export default function RetirementPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // Plan state (matching serializer field names)
  const [plan, setPlan] = useState({
    current_age: "",
    retirement_age: "",
    projected_expenses: "",
    withdrawal_rate: "",
    readiness: 0, // <-- new field to track server-side readiness value
  });
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Income sources state (matching serializer field names)
  const [incomes, setIncomes] = useState([]);
  const [newIncomeSource, setNewIncomeSource] = useState("");
  const [newIncomeAge, setNewIncomeAge] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");

  // Map for editable ages when in remove/edit mode: { [incomeId]: "45" }
  const [editAgeMap, setEditAgeMap] = useState({});
  const [isImporting, setIsImporting] = useState(false);

  const planRef = useRef(null);
  const incomeRef = useRef(null);
  const readinessRef = useRef(null);

  useEffect(() => {
    loadAll();
  }, []);

  // Whenever incomes change, initialize editAgeMap to the current ages (string)
  useEffect(() => {
    const m = {};
    (incomes || []).forEach((inc) => {
      // keep null/undefined as empty string for editing
      m[inc.id] =
        inc.age_available === null || typeof inc.age_available === "undefined"
          ? ""
          : String(inc.age_available);
    });
    setEditAgeMap(m);
  }, [incomes]);

  const loadAll = async () => {
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

    try {
      const r = await getRetIncome();
      setIncomes(r || []);
    } catch (err) {
      console.error("Failed to fetch retirement incomes:", err);
    }
  };

  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    try {
      const payload = {
        current_age: plan.current_age === "" ? null : Number(plan.current_age),
        retirement_age: plan.retirement_age === "" ? null : Number(plan.retirement_age),
        projected_expenses:
          plan.projected_expenses === "" ? null : Number(plan.projected_expenses),
        withdrawal_rate:
          plan.withdrawal_rate === "" ? null : Number(plan.withdrawal_rate),
        // send readiness to backend (same percentage shown by RetirementReadiness)
        readiness: retPercentage,
      };
      await updatePlan(payload);

      // Refresh plan + incomes
      await loadAll();

      // Recalculate investment-based incomes to reflect the newly saved plan
      await recalcInvestmentsAndUpdateIncomes();
    } catch (err) {
      console.error("Failed to update plan:", err);
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Income handlers
  const handleAddIncome = async () => {
    if (!newIncomeSource.trim() || !newIncomeAmount) return;
    const payload = {
      income_source: newIncomeSource,
      age_available: newIncomeAge === "" ? 0 : Number(newIncomeAge),
      amount: Number(newIncomeAmount || 0).toFixed(2),
    };
    try {
      await postRetIncome(payload);
      setNewIncomeSource("");
      setNewIncomeAge("");
      setNewIncomeAmount("");
      await loadAll();
    } catch (err) {
      console.error("Failed to add income:", err);
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await deleteRetIncome(id);
      await loadAll();
    } catch (err) {
      console.error("Failed to delete income:", err);
    }
  };

  const handleUpdateIncomeAge = async (id) => {
    try {
      const row = (incomes || []).find((it) => it.id === id);
      if (!row) return;
      const newAgeStr = editAgeMap[id];
      const payload = {
        income_source: row.income_source,
        age_available: newAgeStr === "" ? null : Number(newAgeStr),
        amount: Number(row.amount || 0),
      };
      // Delete old and post new one (keeps semantics even without PATCH)
      await deleteRetIncome(id);
      await postRetIncome(payload);
      await loadAll();
    } catch (err) {
      console.error("Failed to update income age:", err);
    }
  };

  // Totals & readiness
  const totalMonthlyIncome = incomes.reduce((sum, it) => sum + Number(it.amount || 0), 0);

  const projectedExpenses = Number(plan.projected_expenses || 0);
  const rawCoverage = projectedExpenses > 0 ? (totalMonthlyIncome / projectedExpenses) * 100 : 0;
  const retPercentage = Math.round(Math.min(Math.max(rawCoverage, 0), 100));

  // --- Small addition: compute and format the "Nest Egg" wording shown left of Save ---
  const monthlyExpensesNum = Number(plan.projected_expenses) || 0;
  const withdrawalRateNum = Number(plan.withdrawal_rate) || 0;
  const nestEgg =
    withdrawalRateNum > 0 ? (monthlyExpensesNum * 12) / (withdrawalRateNum / 100) : null;
  const formattedNestEgg =
    nestEgg !== null
      ? `$${Number(nestEgg).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : "—";
  const displayRetAge = plan.retirement_age === "" ? "—" : plan.retirement_age;
  const displayWithdrawalRate =
    plan.withdrawal_rate === "" ? "—" : `${plan.withdrawal_rate}%`;
  // --- end addition ---

  // only digits allowed helper
  const onlyDigits = (s) => /^\d*$/.test(s);

  // setPlan change handlers for integer-only age fields (use text input to remove native spinners)
  const handleAgeChange = (field) => (e) => {
    const v = e.target.value;
    if (onlyDigits(v)) {
      setPlan((s) => ({ ...s, [field]: v }));
    }
  };

  // non-age fields (expenses, withdrawal rate) allow normal typing (decimal allowed)
  const handlePlanFieldChange = (field) => (e) => {
    setPlan((s) => ({ ...s, [field]: e.target.value }));
  };

  // income age input: only digits allowed (prevents 59.5)
  const handleNewIncomeAgeChange = (e) => {
    const v = e.target.value;
    if (onlyDigits(v)) setNewIncomeAge(v);
  };

  // Edit-age text change per-row
  const handleEditAgeChange = (id) => (e) => {
    const v = e.target.value;
    if (onlyDigits(v) || v === "") {
      setEditAgeMap((m) => ({ ...m, [id]: v }));
    }
  };

  // Helper: compute payloads from investments while preserving any user-entered ages
  const computePayloadsFromInvestments = (investments, currentIncomes, currentEditAgeMap, currentPlan) => {
    const payloads = [];

    const currentAge = Number(currentPlan.current_age) || 0;
    const retirementAge = Number(currentPlan.retirement_age) || 0;
    const yearsToRetire = retirementAge > currentAge ? retirementAge - currentAge : 0;
    const monthsToRetire = yearsToRetire * 12;
    const withdrawalRate = Number(currentPlan.withdrawal_rate) || 0;

    // helper to find income by name (trim & compare)
    const findExistingByName = (name) => {
      if (!name) return null;
      const trimmed = String(name).trim();
      return (currentIncomes || []).find((it) => String(it.income_source || "").trim() === trimmed);
    };

    for (const inv of investments) {
      const roiDecimal = (parseFloat(inv.rate_of_return) || 0) / 100;
      let val = parseFloat(inv.value) || 0;
      const monthlyContribution = parseFloat(inv.contribution) || 0;
      const contYears = parseInt(inv.contribution_timeline_years || 0, 10) || 0;
      const contMonths = contYears * 12;

      for (let month = 0; month < monthsToRetire; month++) {
        if (month < contMonths) {
          val = (val + monthlyContribution) * (1 + roiDecimal / 12);
        } else {
          val = val * (1 + roiDecimal / 12);
        }
      }

      const monthlyIncome = (val * (withdrawalRate / 100)) / 12;

      const name = inv.investment_name || `Investment ${inv.id}`;
      const existing = findExistingByName(name);

      let ageToUse = 0;
      if (existing) {
        // prefer user-edited age in editAgeMap if present (non-empty)
        const edited = currentEditAgeMap && typeof currentEditAgeMap[existing.id] !== "undefined"
          ? currentEditAgeMap[existing.id]
          : undefined;

        if (edited !== undefined && edited !== "") {
          // user set it explicitly
          ageToUse = Number(edited) || 0;
        } else if (existing.age_available !== null && typeof existing.age_available !== "undefined") {
          // preserve existing age_available value
          ageToUse = Number(existing.age_available) || 0;
        } else {
          ageToUse = 0;
        }
      } else {
        ageToUse = 0;
      }

      payloads.push({
        income_source: name,
        age_available: ageToUse,
        amount: Number(monthlyIncome || 0).toFixed(2),
      });
    }

    return payloads;
  };

  // --- Import investments and convert to retirement income sources (bulk) ---
  const handleImportInvestments = async () => {
    setIsImporting(true);
    try {
      const invs = await getInvestments();
      const investments = Array.isArray(invs) ? invs : [];

      // Build payloads while preserving user-updated ages if present
      const payloads = computePayloadsFromInvestments(investments, incomes, editAgeMap, plan);

      // Single network request (bulk)
      const refreshedIncomes = await postRetIncomeBulk(payloads);

      // Use returned data to update local state without an extra GET
      setIncomes(refreshedIncomes || []);
    } catch (err) {
      console.error("Failed to import investments:", err);
    } finally {
      setIsImporting(false);
    }
  };

  // Recalculate investments and update incomes (used after saving the retirement plan)
  const recalcInvestmentsAndUpdateIncomes = async () => {
    setIsImporting(true);
    try {
      const invs = await getInvestments();
      const investments = Array.isArray(invs) ? invs : [];

      const payloads = computePayloadsFromInvestments(investments, incomes, editAgeMap, plan);

      const refreshedIncomes = await postRetIncomeBulk(payloads);
      setIncomes(refreshedIncomes || []);
    } catch (err) {
      console.error("Failed to recalc investments after saving plan:", err);
    } finally {
      setIsImporting(false);
    }
  };

  // Helper: check whether the edit field content differs from the stored age (returns true when changed)
  const isAgeChanged = (item) => {
    // normalize stored value to string (null/undefined -> "")
    const stored = item.age_available === null || typeof item.age_available === "undefined" ? "" : String(item.age_available);
    const edited = typeof editAgeMap[item.id] === "undefined" ? "" : String(editAgeMap[item.id]);
    return edited !== stored;
  };

  // Keep a sorted view for display (alphabetical by income_source)
  const sortedIncomes = React.useMemo(() => {
    return [...(incomes || [])].sort((a, b) => {
      const aName = (a?.income_source || "").toLowerCase();
      const bName = (b?.income_source || "").toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    });
  }, [incomes]);

  // ---------------- Inflation / Purchasing Power Calculator dialog ----------------
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcPresentAmount, setCalcPresentAmount] = useState(""); // string so typing is smooth
  const [inflationAvg, setInflationAvg] = useState(null); // percent number, e.g. 2.5
  const [calcFutureValue, setCalcFutureValue] = useState(0);
  const [isFetchingInflation, setIsFetchingInflation] = useState(false);

  const currentYear = new Date().getFullYear();
  const numericCurrentAge = Number(plan.current_age) || 0;
  const numericRetAge = Number(plan.retirement_age) || 0;
  const yearsToRetire = numericRetAge > numericCurrentAge ? numericRetAge - numericCurrentAge : 0;
  const targetYear = currentYear + yearsToRetire;

  const openCalculator = async () => {
    setCalcOpen(true);
    // fetch inflation
    try {
      setIsFetchingInflation(true);
      const resp = await getInflationData();
      const avg = resp?.average_value ?? null;
      setInflationAvg(avg);
    } catch (err) {
      console.error("Failed to fetch inflation data:", err);
      setInflationAvg(null);
    } finally {
      setIsFetchingInflation(false);
    }
  };

  const closeCalculator = () => {
    setCalcOpen(false);
    // keep present amount so the user can re-open and continue typing if desired
  };

  // Recalculate future value whenever present amount, inflationAvg, or yearsToRetire changes
  useEffect(() => {
    const p = parseFloat(calcPresentAmount);
    if (isNaN(p) || p <= 0) {
      setCalcFutureValue(0);
      return;
    }

    const inflationRate = Number(inflationAvg) || 0; // percent per year
    const years = yearsToRetire || 0;

    // If years == 0, future value is same as present (no inflation growth to apply)
    if (years === 0) {
      setCalcFutureValue(Number(p.toFixed(2)));
      return;
    }

    // future_value = present * (1 + inflationRate/100) ** years
    const fv = p * Math.pow(1 + inflationRate / 100, years);
    setCalcFutureValue(Number(fv.toFixed(2)));
  }, [calcPresentAmount, inflationAvg, yearsToRetire]);

  const handleUpdateProjectedExpenses = () => {
    // Replace the projected_expenses with the computed future value
    setPlan((s) => ({ ...s, projected_expenses: String(calcFutureValue) }));
    setCalcOpen(false);
  };

  // ---------------- End calculator ----------------

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        p: 1,
        pl: 0,
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gridTemplateAreas: {
          xs: `
            "header"
            "ret_plan"
            "ret_income"
            "ret_readiness"
            "footer"
          `,
          md: `
            "header header"
            "ret_plan ret_income"
            "ret_readiness ret_readiness"
            "footer footer"
          `,
        },
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box sx={{ gridArea: "header" }}>
        <Typography variant="h4" mb={2}>
          Retirement
        </Typography>
        <AddRemToggle isRemove={isRemoveMode} onClick={() => setIsRemoveMode((s) => !s)} />
      </Box>

      {/* Retirement Plan */}
      <Box sx={{ gridArea: "ret_plan" }}>
        <Paper elevation={3} sx={{ p: 2, boxSizing: "border-box", width: "100%" }} ref={planRef}>
          <Typography variant="h5" mb={2}>
            Retirement Plan
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            {/* For ages we use type="text" + slotProps.htmlInput to remove spinners but keep numeric keyboard */}
            <TextField
              label="Current age"
              value={plan.current_age}
              onChange={handleAgeChange("current_age")}
              type="text"
              slotProps={{ htmlInput: { inputMode: "numeric", pattern: "\\d*" } }}
            />

            <TextField
              label="Desired retirement age"
              value={plan.retirement_age}
              onChange={handleAgeChange("retirement_age")}
              type="text"
              slotProps={{ htmlInput: { inputMode: "numeric", pattern: "\\d*" } }}
            />

            {/* Projected expenses + Calculate button placed in a row */}
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                label="Projected monthly expenses (post-retirement)"
                value={plan.projected_expenses}
                onChange={handlePlanFieldChange("projected_expenses")}
                type="text"
                slotProps={{ htmlInput: { inputMode: "decimal" } }}
                sx={{ flex: 1 }}
              />

              <Button variant="outlined" onClick={openCalculator} sx={{ height: 40 }}>
                Calculate
              </Button>
            </Box>

            <TextField
              label="Withdrawal rate (%)"
              value={plan.withdrawal_rate}
              onChange={handlePlanFieldChange("withdrawal_rate")}
              type="text"
              slotProps={{ htmlInput: { inputMode: "decimal" } }}
            />

            {/* <-- Updated: add Typography left of Save showing nest egg requirement --> */}
            <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1} gap={2}>
              <Typography variant="body2" sx={{ maxWidth: 520 }}>
                In order to retire at {displayRetAge} with a {displayWithdrawalRate} withdrawal rate, you will need a {formattedNestEgg} Nest Egg.
              </Typography>

              <Button onClick={handleSavePlan} variant="contained" disabled={isSavingPlan}>
                Save
              </Button>
            </Box>
            {/* <-- end update --> */}
          </Box>
        </Paper>
      </Box>

      {/* Calculator Dialog */}
      <Dialog open={calcOpen} onClose={closeCalculator}>
        <DialogTitle>Inflation / Purchasing Power Calculator</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter an amount below to see how much you'll need at retirement to match that purchasing power today.
          </DialogContentText>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              label={`Amount in ${currentYear}`}
              value={calcPresentAmount}
              onChange={(e) => setCalcPresentAmount(e.target.value)}
              type="text"
              slotProps={{ htmlInput: { inputMode: "decimal" } }}
            />

            <Box>
              <Typography variant="body1" gutterBottom>
                {calcPresentAmount === "" || Number(calcPresentAmount) === 0
                  ? `Enter an amount in ${currentYear}`
                  : `$${Number(calcPresentAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} in ${currentYear} will have the same purchasing power as`}
              </Typography>

              <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>
                {calcFutureValue > 0
                  ? `$${calcFutureValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} in ${targetYear}`
                  : `0.00 in ${targetYear}`}
              </Typography>

              <Typography variant="caption" sx={{ display: "block", mt: 1, mb: -2 }}>
                This information is based on the average annual inflation from 1960-2024 of {inflationAvg !== null ? `${inflationAvg}%` : "—"}, courtesy of the Federal Reserve Bank of St. Louis.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCalculator}>Cancel</Button>
          <Button onClick={handleUpdateProjectedExpenses} disabled={calcFutureValue === 0}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Retirement Income Sources */}
      <Box sx={{ gridArea: "ret_income" }}>
        <Paper elevation={3} sx={{ p: 2, boxSizing: "border-box", width: "100%" }} ref={incomeRef}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h5">Retirement Income Sources</Typography>

            <Button onClick={handleImportInvestments} variant="outlined" disabled={isImporting} size="small">
              {isImporting ? "Importing..." : "Import Investments"}
            </Button>
          </Box>

          {/* Column headers */}
          <Box display="flex" alignItems="center" mb={1} sx={{ width: "100%" }}>
            <Typography sx={{ width: 160, flexShrink: 0, fontWeight: 600 }}>Source</Typography>
            <Typography sx={{ width: 140, flexShrink: 0, textAlign: "center", fontWeight: 600 }}>
              Age available
            </Typography>
            <Box sx={{ flex: 1, textAlign: "right" }}>
              <Typography sx={{ fontWeight: 600 }}>Monthly amount</Typography>
            </Box>
          </Box>

          {sortedIncomes.map((item) => (
            <Box key={item.id} display="flex" alignItems="center" mb={1} sx={{ width: "100%", minWidth: 0 }}>
              <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: 160 }}>
                <Typography>{item.income_source}</Typography>
              </Box>

              <Box sx={{ width: 140, textAlign: "center" }}>
                {isRemoveMode ? (
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <TextField
                      value={editAgeMap[item.id] ?? ""}
                      onChange={handleEditAgeChange(item.id)}
                      size="small"
                      variant="outlined"
                      type="text"
                      sx={{ width: 100 }}
                      slotProps={{ htmlInput: { inputMode: "numeric", pattern: "\\d*" } }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleUpdateIncomeAge(item.id)}
                      disabled={!isAgeChanged(item)}
                    >
                      Update
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {item.age_available ?? "—"}
                  </Typography>
                )}
              </Box>

              <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, justifyContent: "flex-end" }}>
                <Typography>${Number(item.amount || 0).toFixed(2)} / mo</Typography>

                {isRemoveMode && (
                  <IconButton onClick={() => handleDeleteIncome(item.id)} size="small" aria-label="delete">
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}

          <Typography variant="h6" mt={2}>
            Total: ${totalMonthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>

          {/* Add form appears when in remove/add toggle is ON */}
          {isRemoveMode && (
            <Box mt={2} display="flex" gap={1} sx={{ flexWrap: "wrap", alignItems: "center", width: "100%" }}>
              <TextField
                placeholder="Source name"
                value={newIncomeSource}
                onChange={(e) => setNewIncomeSource(e.target.value)}
                size="small"
                variant="outlined"
                sx={{ width: { xs: "100%", sm: 160 }, flexShrink: 0 }}
              />

              {/* Age available: we use text + slotProps.htmlInput like above to prevent spinners and only allow integers */}
              <TextField
                placeholder="Age available"
                value={newIncomeAge}
                onChange={handleNewIncomeAgeChange}
                size="small"
                variant="outlined"
                type="text"
                sx={{ width: { xs: "100%", sm: 140 }, flexShrink: 0 }}
                slotProps={{ htmlInput: { inputMode: "numeric", pattern: "\\d*" } }}
              />

              <TextField
                placeholder="Monthly amount"
                value={newIncomeAmount}
                onChange={(e) => setNewIncomeAmount(e.target.value)}
                size="small"
                variant="outlined"
                type="text"
                sx={{ width: { xs: "100%", sm: 180 }, flexShrink: 0 }}
                slotProps={{ htmlInput: { inputMode: "decimal" } }}
              />

              <Button onClick={handleAddIncome} variant="contained" sx={{ height: 40, flexShrink: 0 }}>
                Add
              </Button>
            </Box>
          )}

          {/* SSA quick calculator link bottom-right */}
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Typography
              variant="body2"
              component="a"
              href="https://www.ssa.gov/OACT/quickcalc/"
              target="_blank"
              rel="noreferrer"
              color="primary"
              sx={{ textDecoration: "underline", cursor: "pointer" }}
            >
              How much Social Security will I receive?
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Readiness */}
      <Box sx={{ gridArea: "ret_readiness", minWidth: 0 }}>
        <Paper elevation={3} sx={{ p: 2, boxSizing: "border-box", width: "100%" }} ref={readinessRef}>
          <Box
            display="flex"
            gap={2}
            sx={{
              width: "100%",
              boxSizing: "border-box",
              flexDirection: { xs: "column", sm: "row" },     // stack on xs, row on sm+
              alignItems: { xs: "flex-start", sm: "center" }, // left-align text when stacked, center when row
            }}
          >
            {/* Chart / gauge area: takes available width */}
            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <RetirementReadiness percentage={retPercentage} />
            </Box>

            {/* Text area: full width when stacked, fixed width on larger screens */}
            <Box sx={{ width: { xs: "100%", sm: 320 }, flexShrink: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ textAlign: { xs: "left", sm: "left" } }}>
                You're on track to cover {retPercentage}% of your post-retirement expenses.
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={1}>
                Projected monthly expenses: ${projectedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Total retirement income: ${totalMonthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Footer */}
      <Box sx={{ gridArea: "footer", display: "flex", textAlign: "center", justifyContent: "center", alignItems: "center", width: "100%", mt: 0 }}>
        <Typography variant="body2" color="text.secondary">Last updated: {new Date().toLocaleString()}</Typography>
      </Box>
    </Box>
  );
}
