import React from "react";
import { Box, Typography } from "@mui/material";

// A simple horizontal gradient bar with a vertical marker at `percentage` (0-100)
export default function RetirementReadiness({ percentage = 0 }) {
  const clamped = Math.min(Math.max(Number(percentage) || 0, 0), 100);
  const markerLeft = `calc(${clamped}% )`;

  return (
    <Box>
      <Typography variant="h6" align="center" mb={4}>
        Retirement Readiness
      </Typography>

      <Box sx={{ position: "relative", height: 50, borderRadius: 2, overflow: "visible" }}>
        {/* Gradient bar */}
        <Box
          sx={{
            height: 45,
            borderRadius: 1,
            background: "linear-gradient(90deg, #e53935 0%, #ffb300 50%, #43a047 100%)",
            width: "100%",
            boxShadow: (theme) => theme.shadows[1],
          }}
        />

        {/* Marker */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: markerLeft,
            transform: "translateX(-50%)",
            width: 5,
            height: 45,
            backgroundColor: "rgba(0,0,0,0.8)",
            borderRadius: 1,
          }}
        />

        {/* Percentage label above marker */}
        <Box
          sx={{
            position: "absolute",
            top: -26,
            left: markerLeft,
            transform: "translateX(-50%)",
            minWidth: 32,
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle2">{clamped}%</Typography>
        </Box>
      </Box>
    </Box>
  );
}
