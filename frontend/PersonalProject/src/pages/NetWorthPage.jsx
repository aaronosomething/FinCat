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
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import AddRemToggle from "../components/AddRemToggle";
import NetworthChart from "../components/NetworthChart";
import NetworthStats from "../components/NetworthStats";
import {
  getAssets,
  addAsset,
  deleteAsset,
  getLiabilities,
  addLiability,
  deleteLiability,
} from "../networth_api";

export default function NetWorthPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // Assets state
  const [assets, setAssets] = useState([]);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetAmount, setNewAssetAmount] = useState("");

  // Liabilities state
  const [liabilities, setLiabilities] = useState([]);
  const [newLiabilityName, setNewLiabilityName] = useState("");
  const [newLiabilityAmount, setNewLiabilityAmount] = useState("");

  // Refs (optional if you later want to measure)
  const assetsRef = useRef(null);
  const liabilitiesRef = useRef(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const a = await getAssets();
    const l = await getLiabilities();
    setAssets(a || []);
    setLiabilities(l || []);
  };

  // --- Assets handlers ---
  const handleAddAsset = async () => {
    if (!newAssetName.trim() || !newAssetAmount) return;
    await addAsset({ name: newAssetName, amount: parseFloat(newAssetAmount) });
    setNewAssetName("");
    setNewAssetAmount("");
    loadAll();
  };

  const handleDeleteAsset = async (id) => {
    await deleteAsset(id);
    loadAll();
  };

  // --- Liabilities handlers ---
  const handleAddLiability = async () => {
    if (!newLiabilityName.trim() || !newLiabilityAmount) return;
    await addLiability({
      name: newLiabilityName,
      amount: parseFloat(newLiabilityAmount),
    });
    setNewLiabilityName("");
    setNewLiabilityAmount("");
    loadAll();
  };

  const handleDeleteLiability = async (id) => {
    await deleteLiability(id);
    loadAll();
  };

  // Totals
  const totalAssets = assets.reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const totalLiabilities = liabilities.reduce(
    (sum, l) => sum + Number(l.amount || 0),
    0
  );
  const netWorth = totalAssets - totalLiabilities;

  const renderList = (items, onDelete) => (
    <>
      {items.map((item) => (
        <Box
          key={item.id}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
          sx={{
            width: "100%",
            minWidth: 0,
          }}
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
            {item.name}
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
            <Typography>${Number(item.amount).toFixed(2)}</Typography>
            {isRemoveMode && (
              <IconButton
                onClick={() => onDelete(item.id)}
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

  const renderAddForm = (nameVal, setName, amtVal, setAmt, onAdd) => (
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
        placeholder="Name"
        value={nameVal}
        onChange={(e) => setName(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: 160 },
          flexShrink: 0,
        }}
      />
      <TextField
        placeholder="Amount"
        type="number"
        value={amtVal}
        onChange={(e) => setAmt(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: 140 },
          flexShrink: 0,
        }}
      />
      <Button
        onClick={onAdd}
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
            "assets"
            "liabilities"
            "networth_chart"
            "networth_stats"
            "footer"
          `,
          md: `
            "header header"
            "assets networth_chart"
            "liabilities networth_stats"
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
          Net Worth
        </Typography>
        <AddRemToggle
          isRemove={isRemoveMode}
          onClick={() => setIsRemoveMode((s) => !s)}
        />
      </Box>

      {/* Assets */}
      <Box sx={{ gridArea: "assets" }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            boxSizing: "border-box",
            width: "100%",
          }}
          ref={assetsRef}
        >
          <Typography variant="h5" mb={2}>
            Assets
          </Typography>

          {renderList(assets, handleDeleteAsset)}

          <Typography variant="h6" mt={2}>
            Total: ${totalAssets.toFixed(2)}
          </Typography>

          {isRemoveMode &&
            renderAddForm(
              newAssetName,
              setNewAssetName,
              newAssetAmount,
              setNewAssetAmount,
              handleAddAsset
            )}
        </Paper>
      </Box>

      {/* Liabilities */}
      <Box sx={{ gridArea: "liabilities" }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            boxSizing: "border-box",
            width: "100%",
          }}
          ref={liabilitiesRef}
        >
          <Typography variant="h5" mb={2}>
            Liabilities
          </Typography>

          {renderList(liabilities, handleDeleteLiability)}

          <Typography variant="h6" mt={2}>
            Total: ${totalLiabilities.toFixed(2)}
          </Typography>

          {isRemoveMode &&
            renderAddForm(
              newLiabilityName,
              setNewLiabilityName,
              newLiabilityAmount,
              setNewLiabilityAmount,
              handleAddLiability
            )}
        </Paper>
      </Box>

      {/* Net Worth Chart */}
      <Box sx={{ gridArea: "networth_chart" }}>
        <Paper elevation={3} sx={{ p: 2, boxSizing: "border-box", width: "100%" }}>
          <Typography variant="h5" mb={2}>
            Net Worth Breakdown
          </Typography>

          <NetworthChart assets={assets} liabilities={liabilities} />
        </Paper>
      </Box>

      {/* Stats */}
      <Box sx={{ gridArea: "networth_stats" }}>
        <NetworthStats netWorth={netWorth} />
      </Box>

      {/* Footer area - optional extra summary or controls; kept to mirror BudgetPage */}
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
