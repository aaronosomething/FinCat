import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useItemHighlighted } from "@mui/x-charts";

export default function NetworthChart({ assets = [], liabilities = [] }) {
  // assets-only series for the main chart (left)
  const assetSeries = useMemo(() => {
    return (assets || [])
      .map((a) => ({
        id: `asset-${a.id}`,
        label: a.name,
        value: Number(a.amount || 0),
      }))
      .filter((s) => s.value > 0);
  }, [assets]);

  // totals for the donut ratio chart (right)
  const { totalAssets, totalLiabilities, ratioPercent } = useMemo(() => {
    const tAssets = (assets || []).reduce((sum, a) => sum + Number(a.amount || 0), 0);
    const tLiabs = (liabilities || []).reduce((sum, l) => sum + Number(l.amount || 0), 0);

    // ratio = assets / (assets + liabilities) expressed as percent (safe against div by zero)
    const denom = tAssets + tLiabs;
    const ratio = denom > 0 ? (tAssets / denom) * 100 : 0;
    return {
      totalAssets: tAssets,
      totalLiabilities: tLiabs,
      ratioPercent: Math.round(ratio), // show whole percent
    };
  }, [assets, liabilities]);

  // The donut data (no breakdown by name here)
  const donutData = useMemo(
    () => [
      { label: "Assets", value: totalAssets > 0 ? totalAssets : 0 },
      { label: "Liabilities", value: totalLiabilities > 0 ? totalLiabilities : 0 },
    ],
    [totalAssets, totalLiabilities]
  );

  const valueFormatter = (item) => `$${Number(item.value || 0).toLocaleString()}`;

  if ((assetSeries.length === 0) && totalAssets === 0 && totalLiabilities === 0) {
    return <Typography variant="body2">No data to display.</Typography>;
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        // allow wrapping on small viewports
        flexWrap: "wrap",
      }}
    >
      {/* Left: main assets-only pie */}
      <Box sx={{ flex: 1, minWidth: 260, mr: -2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Assets Breakdown
        </Typography>

        <Box sx={{ width: "100%", height: 300 }}>
          <PieChart
            series={[
              {
                data: assetSeries.map((s) => ({ value: s.value, label: s.label })),
                // keep individual asset slices and default behaviors
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray'},
                highlightScope: { fade: "global", highlight: "item" },
                valueFormatter,
              },
            ]}
            sx={{ height: 300 }}
          />
        </Box>
      </Box>

      {/* Right: small donut with ratio */}
      <Box
        sx={{
          width: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          mr: 2,
          ml: -2,
        }}
      >
        <Typography variant="subtitle1" align="center">
          Your Asset to Liability Ratio
        </Typography>

        <Box sx={{ position: "relative", width: "100%", height: 100 }}>
          <PieChart
            series={[
              {
                data: donutData.map((d) => ({ value: d.value })),
                innerRadius: 30, // inner radius (px)
                outerRadius: 50, // outer radius (px) -> diameter ~100
                // hide labels/legend; keep default highlighting
                // small donut shouldn't show slice labels by default
                showLabel: false,
                valueFormatter,
              },
            ]}
            sx={{height: 100 }}
          />

          {/* Center percentage overlay */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Typography variant="subtitle1" align="center">
              {isFinite(ratioPercent) ? `${ratioPercent}%` : "—"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


// export default function NetworthChart({ assets = [], liabilities = [] }) {
//   // Combine assets and liabilities into one pie dataset.
//   // We'll prefix liabilities with '-' in label or mark them differently.
//   const series = useMemo(() => {
//     // show liabilities as positive values but group them under a "Liabilities" slice for clarity,
//     // while also showing individual names. We'll make values positive for the pie (no negative slices).
//     // Chart consumer can highlight slices on hover.
//     const assetSeries = assets.map((a) => ({
//       id: `asset-${a.id}`,
//       label: a.name,
//       value: Number(a.amount || 0),
//       category: "asset",
//     }));

//     const liabilitySeries = liabilities.map((l) => ({
//       id: `liab-${l.id}`,
//       label: l.name,
//       value: Number(l.amount || 0),
//       category: "liability",
//     }));

//     // combine, but filter 0-value items
//     return [...assetSeries, ...liabilitySeries].filter((s) => s.value > 0);
//   }, [assets, liabilities]);

//   if (!series.length) {
//     return <Typography variant="body2">No data to display.</Typography>;
//   }

//   const valueFormatter = (item) => `$${item.value.toLocaleString()}`;
//   return (
//     <Box sx={{ width: "100%", height: 300 }}>
//       <PieChart
//         series={[
//           {
//             data: series.map((s) => ({ value: s.value, label: s.label })),
//             highlightScope: {fade: 'global', highlight: 'item'},
//             faded: { innerRadius: 30, additionalRadius: -30, color: 'gray'},
//             valueFormatter,
//           },
//         ]}
//         sx={{ height: 300 }}
//       />
//     </Box>
//   );
// }
