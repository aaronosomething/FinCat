import React from "react";
import { Paper, Typography, Box } from "@mui/material";

export default function NetworthStats({ netWorth = 0 }) {
  // Format nicely with 2 decimals and thousands separators
  const formatted = Number(netWorth).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Paper elevation={3} sx={{ p: 2, boxSizing: "border-box", width: "100%" }}>
      <Typography variant="h5" mb={1}>
        Summary
      </Typography>
      <Box>
        <Typography variant="body1" mb={1}>
          Your estimated Net Worth is:
        </Typography>
        <Typography variant="h5">${formatted}</Typography>
      </Box>
    </Paper>
  );
}
