// components/InvestChart.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, useTheme, Typography } from "@mui/material";
import { LineChart, lineElementClasses } from "@mui/x-charts/LineChart";


function computeYearlySeries(inv, endYear) {
  const roiDecimal = (parseFloat(inv.rate_of_return) || 0) / 100; // convert percent to decimal
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
      // contribute then compound monthly
      val = (val + monthlyContribution) * (1 + roiDecimal / 12);
    } else {
      // only compound
      val = val * (1 + roiDecimal / 12);
    }

    // record the value at the end of each year (month indices 11, 23, 35, ...)
    if ((month + 1) % 12 === 0) {
      const yearIndex = Math.floor((month + 1) / 12);
      if (yearIndex <= endYear) years[yearIndex] = val;
    }
  }

  // Fill any missing entries defensively (carry forward last known)
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

export default function InvestChart({ investments, endYear, retirementGoal, showRetirementGoal }) {
  const theme = useTheme();

  const { series, xLabels, maxTotal } = useMemo(() => {
    const invs = (investments || []).map((inv) => ({
      ...inv,
      numericValue: parseFloat(inv.value) || 0,
    }));

    // sort so largest initial value is first (bottom of the stack)
    invs.sort((a, b) => b.numericValue - a.numericValue);

    // make x labels actual years (calendar years)
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
        // format values in the tooltip as USD with 2 decimals
        valueFormatter: (v) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(v),
      };
    });

    // compute per-year totals across series to find max Y
    const totals = new Array(endYear + 1).fill(0);
    for (const s of builtSeries) {
      for (let i = 0; i < s.data.length; i++) {
        totals[i] += Number(s.data[i] || 0);
      }
    }
    const overallMax = totals.reduce((m, v) => (v > m ? v : m), 0);

    return { series: builtSeries, xLabels: labels, maxTotal: overallMax };
  }, [investments, endYear]);

  if (!investments || investments.length === 0) {
    return (
      <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        No investments to display
      </Box>
    );
  }

  // margin/padding
  const margin = { right: 24, left: 0 };

  // axis formatter for whole-number ticks with currency and commas
  const axisCurrencyFormatter = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  // compute the top position (percentage) for the retirementGoal line within the chart box
  // If maxTotal is 0, avoid division-by-zero. Positioning: 0% = top, 100% = bottom, so:
  // topPercent = (1 - (retirementGoal / maxTotal)) * 100
  let goalTopPercent = null;
  if (showRetirementGoal && typeof retirementGoal === "number" && retirementGoal > 0 && maxTotal > 0) {
    const raw = 1 - retirementGoal / maxTotal;
    // clamp between 0 and 1 so line stays within chart; if retirementGoal > maxTotal, clamp to 0
    const clamped = Math.min(Math.max(raw, 0), 1);
    goalTopPercent = clamped * 100;
    // If retirementGoal > maxTotal => raw < 0 => clamped = 0 => line at very top
  }


  return (
    <Box sx={{ width: "100%", height: 360, mb: 2, position: "relative" }}>
      <LineChart
        height={360}
        series={series}
        // xAxis uses point scale with calendar year labels
        xAxis={[{ scaleType: "point", data: xLabels }]}
        // yAxis uses a valueFormatter to show $ and commas
        yAxis={[{ width: 90, valueFormatter: axisCurrencyFormatter }]}
        margin={margin}
        sx={{
          // hide the thin line elements (show only filled areas)
          [`& .${lineElementClasses.root}`]: {
            display: "none",
          },
          // ensure the chart respects theme text color for labels
          "& .MuiTypography-root": {
            color: theme.palette.text.primary,
          },
        }}
      />

      {/* Retirement goal dashed line overlay */}
      {showRetirementGoal && goalTopPercent !== null && (
        <>
          <Box
            sx={{
              position: "absolute",
              left: margin.left,
              right: margin.right,
              top: `${goalTopPercent}%`,
              transform: "translateY(-50%)",
              borderTop: `2px dashed ${theme.palette.text.secondary}`,
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 8 + margin.right,
              top: `${goalTopPercent}%`,
              transform: "translateY(-50%)",
              backgroundColor: theme.palette.background.paper,
              px: 1,
              borderRadius: 1,
              boxShadow: theme.shadows[1],
            }}
          >
            <Typography variant="caption">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(retirementGoal)}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

InvestChart.propTypes = {
  investments: PropTypes.arrayOf(PropTypes.object),
  endYear: PropTypes.number,
  retirementGoal: PropTypes.number,
  showRetirementGoal: PropTypes.bool,
};

InvestChart.defaultProps = {
  investments: [],
  endYear: 30,
  retirementGoal: null,
  showRetirementGoal: false,
};
