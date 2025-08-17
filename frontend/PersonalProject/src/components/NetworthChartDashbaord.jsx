// components/NetworthChartDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { getAssets, getLiabilities, getInvestmentsSum } from "../networth_api";

export default function NetworthChartDashboard() {
    // --- state hooks (always declared) ---
    const [assets, setAssets] = useState(null); // null = loading
    const [liabilities, setLiabilities] = useState(null);
    const [investSum, setInvestSum] = useState(0);
    const [error, setError] = useState(null);

    // read localStorage flag to determine whether to include investments
    const includeInvestments =
        typeof window !== "undefined" && localStorage.getItem("investments_included") === "true";

    // --- effects (always declared) ---
    useEffect(() => {
        let mounted = true;
        const loadAll = async () => {
            try {
                const [a, l] = await Promise.all([getAssets(), getLiabilities()]);
                if (!mounted) return;
                setAssets(Array.isArray(a) ? a : []);
                setLiabilities(Array.isArray(l) ? l : []);
            } catch (err) {
                console.error("Failed to load networth data:", err);
                if (mounted) {
                    setError("Failed to load assets or liabilities");
                    setAssets([]);
                    setLiabilities([]);
                }
            }
        };
        loadAll();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadInvestSum = async () => {
            if (!includeInvestments) {
                setInvestSum(0);
                return;
            }
            try {
                const sum = await getInvestmentsSum();
                if (!mounted) return;
                setInvestSum(Number(sum || 0));
            } catch (err) {
                console.error("Failed to fetch investments sum:", err);
                if (mounted) {
                    setInvestSum(0);
                }
            }
        };
        loadInvestSum();
        return () => {
            mounted = false;
        };
    }, [includeInvestments]);

    // --- memos (always declared, defensive against null) ---
    const assetSeries = useMemo(() => {
        const base = (assets || []).map((a) => ({
            id: `asset-${a.id}`,
            label: a.name,
            value: Number(a.amount || 0),
        }));

        if (includeInvestments && Number(investSum) > 0) {
            base.push({
                id: "asset-investments",
                label: "Investments",
                value: Number(investSum || 0),
            });
        }

        return base.filter((s) => Number(s.value) > 0);
    }, [assets, includeInvestments, investSum]);

    const totals = useMemo(() => {
        const tAssets =
            (assets || []).reduce((sum, a) => sum + Number(a.amount || 0), 0) +
            (includeInvestments ? Number(investSum || 0) : 0);

        const tLiabs = (liabilities || []).reduce((sum, l) => sum + Number(l.amount || 0), 0);

        const denom = tAssets + tLiabs;
        const ratio = denom > 0 ? (tAssets / denom) * 100 : 0;

        return {
            totalAssets: tAssets,
            totalLiabilities: tLiabs,
            ratioPercent: Math.round(ratio),
        };
    }, [assets, liabilities, includeInvestments, investSum]);

    const donutData = useMemo(
        () => [
            { label: "Assets", value: totals.totalAssets > 0 ? totals.totalAssets : 0 },
            { label: "Liabilities", value: totals.totalLiabilities > 0 ? totals.totalLiabilities : 0 },
        ],
        [totals.totalAssets, totals.totalLiabilities]
    );

    // simple formatter (not a hook)
    const valueFormatter = (item) => `$${Number(item.value || 0).toLocaleString()}`;

    // Format net worth as USD with two decimals
    const netWorth = useMemo(() => {
        const nw = totals.totalAssets - totals.totalLiabilities;
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(nw);
    }, [totals.totalAssets, totals.totalLiabilities]);

    // --- render-time early returns (no hooks here) ---
    if (assets === null || liabilities === null) {
        return (
            <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography>Loading net worth...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (assetSeries.length === 0 && totals.totalAssets === 0 && totals.totalLiabilities === 0) {
        return <Typography variant="body2">No data to display.</Typography>;
    }

    // --- actual UI ---
    return (
        <Paper sx={{ width: "100%", mb: 2, p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                <Typography variant="h5">Net Worth</Typography>
            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                {/* Left: main assets-only pie */}
                <Box sx={{ flex: 1, minWidth: 180, mr: -2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Assets Breakdown
                    </Typography>

                    <Box sx={{ width: "100%", height: 300 }}>
                        <PieChart
                            series={[
                                {
                                    data: assetSeries.map((s) => ({ value: s.value, label: s.label })),
                                    faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
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
                                    innerRadius: 30,
                                    outerRadius: 50,
                                    showLabel: false,
                                    valueFormatter,
                                },
                            ]}
                            sx={{ height: 100 }}
                        />

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
                                {isFinite(totals.ratioPercent) ? `${totals.ratioPercent}%` : "—"}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 0.5, textAlign: "center" }}>
                        <Typography variant="caption" display="block">
                            Assets: ${totals.totalAssets.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" display="block">
                            Liabilities: ${totals.totalLiabilities.toLocaleString()}
                        </Typography>
                    </Box>

                    {/* New: Estimated Net Worth */}
                    <Box sx={{ mt: 6, textAlign: "center" }}>
                        <Typography variant="subtitle1">Your Estimated Net Worth:</Typography>
                        <Typography variant='h5'>{netWorth}</Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}
