// components/InvestChart.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, useTheme } from "@mui/material";
import { LineChart, lineElementClasses } from "@mui/x-charts/LineChart";

/**
 * InvestChart (Stacked Area)
 *
 * Props:
 *  - investments: array of { id, investment_name, value, rate_of_return, contribution, contribution_timeline_years }
 *  - endYear: integer
 *
 * Produces a stacked area chart with one point per year: years 0..endYear.
 * Series are ordered so the largest initial-value investment is rendered first (bottom of stack).
 * X axis labels are calendar years (current year ... current year + endYear).
 * Y axis ticks are formatted as USD with commas. Tooltips show USD with two decimals.
 */

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

export default function InvestChart({ investments, endYear }) {
  const theme = useTheme();

  const { series, xLabels } = useMemo(() => {
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

    return { series: builtSeries, xLabels: labels };
  }, [investments, endYear]);

  if (!investments || investments.length === 0) {
    return (
      <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        No investments to display
      </Box>
    );
  }

  // margin/padding similar to your example
  const margin = { right: 24, left: 0 };

  // axis formatter for whole-number ticks with currency and commas (no cents)
  const axisCurrencyFormatter = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  return (
    <Box sx={{ width: "100%", height: 360, mb: 2}}>
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
    </Box>
  );
}

InvestChart.propTypes = {
  investments: PropTypes.arrayOf(PropTypes.object),
  endYear: PropTypes.number,
};

InvestChart.defaultProps = {
  investments: [],
  endYear: 20,
};
