// src/components/RetirementReadinessDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import RetirementReadiness from "./RetirementReadiness";
import { getPlan, getRetIncome } from "../retire_api"; // adjust path if needed

export default function RetirementReadinessDashboard() {
  const readinessRef = useRef(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingIncomes, setLoadingIncomes] = useState(true);
  const [error, setError] = useState(null);

  const [plan, setPlan] = useState({
    current_age: "",
    retirement_age: "",
    projected_expenses: "",
    withdrawal_rate: "",
    readiness: 0,
  });

  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoadingPlan(true);
      setLoadingIncomes(true);
      setError(null);

      try {
        const p = await getPlan();
        if (!mounted) return;
        setPlan({
          current_age: p?.current_age ?? "",
          retirement_age: p?.retirement_age ?? "",
          projected_expenses: p?.projected_expenses ?? "",
          withdrawal_rate: p?.withdrawal_rate ?? "",
          readiness:
            typeof p?.readiness !== "undefined" && p?.readiness !== null
              ? Number(p.readiness)
              : 0,
        });
      } catch (err) {
        console.error("Failed to fetch plan:", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoadingPlan(false);
      }

      try {
        const r = await getRetIncome();
        if (!mounted) return;
        setIncomes(r || []);
      } catch (err) {
        console.error("Failed to fetch retirement incomes:", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoadingIncomes(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // compute totals and the same retPercentage logic you use on the page
  const totalMonthlyIncome = (incomes || []).reduce(
    (sum, it) => sum + Number(it.amount || 0),
    0
  );

  const projectedExpenses = Number(plan.projected_expenses || 0);
  const rawCoverage =
    projectedExpenses > 0 ? (totalMonthlyIncome / projectedExpenses) * 100 : 0;
  const computedRetPercentage = Math.round(Math.min(Math.max(rawCoverage, 0), 100));

  // The gauge should use the server's stored readiness value (fetched from plan.readiness).
  // If it's missing, fall back to the locally computed percentage.
  const serverReadiness =
    typeof plan.readiness !== "undefined" && plan.readiness !== null
      ? Math.round(Math.min(Math.max(Number(plan.readiness) || 0, 0), 100))
      : computedRetPercentage;

  const loading = loadingPlan || loadingIncomes;

  return (
    <Box sx={{ gridArea: "ret_readiness", minWidth: 0 }}>
      <Paper
        elevation={3}
        sx={{ p: 2, boxSizing: "border-box", width: "100%" }}
        ref={readinessRef}
      >
        <Box
          display="flex"
          gap={2}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            flexDirection: { xs: "column", sm: "row" }, // stack on xs, row on sm+
            alignItems: { xs: "flex-start", sm: "center" }, // left-align text when stacked, center when row
          }}
        >
          {/* Chart / gauge area: takes available width */}
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            {loading ? (
              <Box
                sx={{
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Box
                sx={{
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="error">
                  Error loading readiness
                </Typography>
              </Box>
            ) : (
              <RetirementReadiness percentage={serverReadiness} />
            )}
          </Box>

          {/* Text area: full width when stacked, fixed width on larger screens */}
          <Box sx={{ width: { xs: "100%", sm: 320 }, flexShrink: 1, minWidth: 0 , ml: 1}}>
            <Typography variant="subtitle1" sx={{ textAlign: { xs: "left", sm: "left" } }}>
              You're on track to cover {computedRetPercentage}% of your post-retirement expenses.
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1}>
              Projected monthly expenses: $
              {projectedExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Total retirement income: $
              {totalMonthlyIncome.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              / mo
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
