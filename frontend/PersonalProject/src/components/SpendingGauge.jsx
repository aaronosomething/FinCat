import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
    GaugeContainer,
    GaugeReferenceArc,
    GaugeValueArc,
    useGaugeState,
    GaugeValueText,
} from '@mui/x-charts/Gauge';
import {
    getIncome,
    getExpenses,
    getDeductions,
} from '../budget_api';


/**
 * Props:
 * - totalIncome (number)
 * - totalDeductions (number)
 * - totalExpenses (number)
 *
 * Uses netIncome = totalIncome - totalDeductions as the "earned income" baseline.
 */
function GaugePointer() {
    const { valueAngle, outerRadius, cx, cy } = useGaugeState();

    if (valueAngle === null) {
        // No value to display
        return null;
    }

    const target = {
        x: cx + outerRadius * Math.sin(valueAngle),
        y: cy - outerRadius * Math.cos(valueAngle),
    };
    return (
        <g>
            <circle cx={cx} cy={cy} r={5} fill="red" />
            <path
                d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
                stroke="red"
                strokeWidth={3}
            />
        </g>
    );
}


export default function SpendingGauge({ totalIncome = 0, totalDeductions = 0, totalExpenses = 0 }) {

    const theme = useTheme();

    const { ratio, display, gaugeValue } = useMemo(() => {
        const netIncome = Number(totalIncome || 0) - Number(totalDeductions || 0);

        if (!isFinite(netIncome) || netIncome <= 0) {
            return { ratio: 0, display: 'N/A', gaugeValue: 0 };
        }

        const raw = (Number(totalExpenses || 0) / netIncome) * 100;
        // clamp between 0 and 100 for the gauge
        const clamped = Math.max(0, Math.min(100, raw));
        const rounded = Math.round(clamped);
        return {
            ratio: clamped,
            display: `${rounded}%`,
            gaugeValue: clamped,
        };
    }, [totalIncome, totalDeductions, totalExpenses]);

    // color rule: green < 70, yellow 70-90, red > 90
    const textColor = useMemo(() => {
        if (ratio < 70) return theme.palette.success.main;
        if (ratio <= 90) return theme.palette.warning.main;
        return theme.palette.error.main;
    }, [ratio, theme]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '90%',
                maxWidth: 800,
                mx: 'auto',
            }}
        >
            {/* Gauge */}
            <Box sx={{ width: 300, height: 300 }}>
                <GaugeContainer
                    width={300}
                    height={300}
                    startAngle={-100}
                    endAngle={100}
                    value={gaugeValue}
                    valueMin={0}
                    valueMax={100}
                    role="meter"
                    aria-valuenow={Math.round(gaugeValue)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Spending ratio"
                >
                    <GaugeReferenceArc />
                    <GaugeValueArc skipAnimation={false} />
                    <GaugePointer />
                </GaugeContainer>
            </Box>

            {/* Centered Text Underneath */}
            <Typography
                variant="h6"
                sx={{ color: textColor, fontWeight: 600, textAlign: 'center', mt: -4}}
            >
                You are spending {display} of your earned income
            </Typography>
            <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ textAlign: 'center', mt: 1 }}
            >
                Based on income: ${totalIncome}, deductions: ${totalDeductions}, and expenses: ${totalExpenses}.
            </Typography>
        </Box>
    );
}
