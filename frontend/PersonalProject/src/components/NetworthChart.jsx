import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useItemHighlighted } from "@mui/x-charts";

export default function NetworthChart({ assets = [], liabilities = [] }) {
  // Combine assets and liabilities into one pie dataset.
  // We'll prefix liabilities with '-' in label or mark them differently.
  const series = useMemo(() => {
    // show liabilities as positive values but group them under a "Liabilities" slice for clarity,
    // while also showing individual names. We'll make values positive for the pie (no negative slices).
    // Chart consumer can highlight slices on hover.
    const assetSeries = assets.map((a) => ({
      id: `asset-${a.id}`,
      label: a.name,
      value: Number(a.amount || 0),
      category: "asset",
    }));

    const liabilitySeries = liabilities.map((l) => ({
      id: `liab-${l.id}`,
      label: l.name,
      value: Number(l.amount || 0),
      category: "liability",
    }));

    // combine, but filter 0-value items
    return [...assetSeries, ...liabilitySeries].filter((s) => s.value > 0);
  }, [assets, liabilities]);

  if (!series.length) {
    return <Typography variant="body2">No data to display.</Typography>;
  }

  const valueFormatter = (item) => `$${item.value.toLocaleString()}`;
  return (
    <Box sx={{ width: "100%", height: 300 }}>
      <PieChart
        series={[
          {
            data: series.map((s) => ({ value: s.value, label: s.label })),
            highlightScope: {fade: 'global', highlight: 'item'},
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray'},
            valueFormatter,
          },
        ]}
        // The chart library supports interactions and highlighting; keep defaults.
        // If your version supports `innerRadius`, `outerRadius`, `tooltip`, pass those here.
        // Example props you might add:
        // innerRadius={5}
        sx={{ height: 300 }}
      />
    </Box>
  );
}
