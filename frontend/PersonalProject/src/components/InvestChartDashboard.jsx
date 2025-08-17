// components/InvestChartDashboard.jsx
import React, { useMemo, useEffect, useState } from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { LineChart, lineElementClasses } from "@mui/x-charts/LineChart";
import { getInvestments } from "../investment_api";

/**
 * InvestChartDashboard
 *
 * Standalone dashboard component that:
 *  - fetches investments via getInvestments()
 *  - renders the same stacked-area logic as InvestChart.jsx
 *  - fixed to 20 years and shows header "Portfolio Growth Over The Next 20 Years"
 */

function computeYearlySeries(inv, endYear) {
  const roiDecimal = (parseFloat(inv.rate_of_return) || 0) / 100;
  const invVal0 = parseFloat(inv.value) || 0;
  const monthlyContribution = parseFloat(inv.contribution) || 0;
  const contYears = parseInt(inv.contribution_timeline_years || 0, 10) || 0;

  const years = new Array(endYear + 1).fill(0);
  let val = invVal0;

  // year 0 = starting value before growth
  years[0] = val;

  const totalMonths = endYear * 12;
  const contMonths = contYears * 12;

  for (let month = 0; month < totalMonths; month++) {
    if (month < contMonths) {
      val = (val + monthlyContribution) * (1 + roiDecimal / 12);
    } else {
      val = val * (1 + roiDecimal / 12);
    }

    if ((month + 1) % 12 === 0) {
      const yearIndex = Math.floor((month + 1) / 12);
      if (yearIndex <= endYear) years[yearIndex] = val;
    }
  }

  let last = years[0] || 0;
  for (let y = 0; y <= endYear; y++) {
    if (typeof years[y] === "undefined" || years[y] === null) {
      years[y] = last;
    } else {
      last = years[y];
    }
  }

  return years;
}

export default function InvestChartDashboard() {
  const theme = useTheme();
  const [investments, setInvestments] = useState(null);
  const [error, setError] = useState(null);
  const endYear = 20; // fixed as requested

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getInvestments();
        if (mounted) setInvestments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching investments", err);
        if (mounted) {
          setError("Failed to load investments");
          setInvestments([]);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const { series, xLabels } = useMemo(() => {
    const invs = (investments || []).map((inv) => ({
      ...inv,
      numericValue: parseFloat(inv.value) || 0,
    }));

    invs.sort((a, b) => b.numericValue - a.numericValue);

    const currentYear = new Date().getFullYear();
    const labels = [];
    for (let y = 0; y <= endYear; y++) {
      labels.push(String(currentYear + y));
    }

    const builtSeries = invs.map((inv) => {
      const data = computeYearlySeries(inv, endYear);
      return {
        data,
        label: inv.investment_name || `inv-${inv.id}`,
        area: true,
        stack: "total",
        showMark: false,
        valueFormatter: (v) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(v),
      };
    });

    return { series: builtSeries, xLabels: labels };
  }, [investments, endYear]);

  if (investments === null) {
    return (
      <Box sx={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading investments...
      </Box>
    );
  }

  return (
    <Paper sx={{ width: "100%", mb: 2, p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
        <Typography variant="h5">Portfolio Growth Over The Next 20 Years</Typography>
      </Box>

      {error ? (
        <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {error}
        </Box>
      ) : investments.length === 0 ? (
        <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
          No investments to display
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: 360, mb: 2}}>
          <LineChart
            height={360}
            series={series}
            xAxis={[{ scaleType: "point", data: xLabels }]}
            yAxis={[
              {
                width: 90,
                valueFormatter: (v) =>
                  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v),
              },
            ]}
            margin={{ right: 24, left: 0 }}
            sx={{
              [`& .${lineElementClasses.root}`]: {
                display: "none",
              },
              "& .MuiTypography-root": {
                color: theme.palette.text.primary,
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
