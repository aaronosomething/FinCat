// MarketPerformance.jsx
import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  ButtonGroup,
  Button,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import { getMarketGains } from "../investment_api";

/**
 * Shows market performance for S&P500 (VOO), NASDAQ 100 (QQQ), DOW JONES (DIA),
 * and BITCOIN. Calls getMarketGains() on mount (which uses localStorage caching).
 */
export default function MarketPerformance() {
  // Period is one of 'Day', 'Week', 'Month', 'Year'
  const [period, setPeriod] = useState("Day");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map UI labels to the keys the backend returns
  const assetMap = {
    "S&P500": "VOO",
    "NASDAQ 100": "QQQ",
    "DOW JONES": "DOW JONES",
    BITCOIN: "Bitcoin",
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await getMarketGains(); // uses investment_api caching
        if (!mounted) return;
        setData(resp);
      } catch (err) {
        console.error("Failed to load market gains:", err);
        if (mounted) setError("Failed to load market performance");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Helper - format percent with sign and color
  const renderPercent = (pct) => {
    if (pct === null || pct === undefined || Number.isNaN(pct)) {
      return (
        <Typography variant="h6" align="center">
          N/A
        </Typography>
      );
    }
    const num = Number(pct);
    const sign = num >= 0 ? "+" : ""; // negative numbers already have '-'
    const display = `${sign}${num.toFixed(1)}%`; // one decimal place as requested
    const color = num >= 0 ? "success.main" : "error.main";

    return (
      <Typography variant="h6" align="center" sx={{ color }}>
        {display}
      </Typography>
    );
  };

  // Determine an "as of" date to show (use the latest asset as_of if available)
  const getAsOf = () => {
    if (!data || typeof data !== "object") return null;
    let dates = [];
    Object.values(assetMap).forEach((sym) => {
      const asset = data[sym];
      if (asset && asset.as_of) dates.push(asset.as_of);
    });
    if (dates.length === 0) return null;
    // choose the max (latest) string; the as_of shape is "YYYY-MM-DD"
    const latest = dates.sort().reverse()[0];
    return latest;
  };

  const asOf = getAsOf();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" align="left">
          Market Performance
        </Typography>
      </Box>

      <Box mt={2} display="flex" justifyContent="center">
        <ButtonGroup variant="outlined" aria-label="Basic button group">
          {["Day", "Week", "Month", "Year"].map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              // visually indicate selected by making it contained
              variant={period === p ? "contained" : "outlined"}
            >
              {p}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Box mt={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box py={4}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1} mt={1}>
            {Object.entries(assetMap).map(([label, apiKey]) => {
              // guard: data may be missing or contain an error
              const asset = data && data[apiKey];
              let pct = null;
              if (asset && asset.changes_pct && period in asset.changes_pct) {
                pct = asset.changes_pct[period];
                // sometimes backend may return percentages as strings - coerce
                if (typeof pct === "string") {
                  const parsed = Number(pct);
                  pct = Number.isNaN(parsed) ? null : parsed;
                }
              }

              return (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Box
                    sx={{
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      p: 1.5,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle2" align="center" sx={{ mb: 0 }}>
                      {label}
                    </Typography>
                    {renderPercent(pct)}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Paper>
  );
}
