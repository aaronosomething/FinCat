// import React, { useMemo } from 'react';
// import { Box, Typography, useTheme } from '@mui/material';
// import {
//     GaugeContainer,
//     GaugeReferenceArc,
//     GaugeValueArc,
//     useGaugeState,
//     GaugeValueText,
// } from '@mui/x-charts/Gauge';
import {
    getIncome,
    getExpenses,
    getDeductions,
} from '../budget_api';


// /**
//  * Props:
//  * - totalIncome (number)
//  * - totalDeductions (number)
//  * - totalExpenses (number)
//  *
//  * Uses netIncome = totalIncome - totalDeductions as the "earned income" baseline.
//  */
// function GaugePointer() {
//     const { valueAngle, outerRadius, cx, cy } = useGaugeState();

//     if (valueAngle === null) {
//         // No value to display
//         return null;
//     }

//     const target = {
//         x: cx + outerRadius * Math.sin(valueAngle),
//         y: cy - outerRadius * Math.cos(valueAngle),
//     };
//     return (
//         <g>
//             <circle cx={cx} cy={cy} r={5} fill="red" />
//             <path
//                 d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
//                 stroke="red"
//                 strokeWidth={3}
//             />
//         </g>
//     );
// }


// export default function SpendingGauge({ totalIncome = 0, totalDeductions = 0, totalExpenses = 0 }) {

//     const theme = useTheme();
//     const netProfit = (totalIncome - totalDeductions - totalExpenses)

//     const { ratio, display, gaugeValue } = useMemo(() => {
//         const netIncome = Number(totalIncome || 0) - Number(totalDeductions || 0);

//         if (!isFinite(netIncome) || netIncome <= 0) {
//             return { ratio: 0, display: 'N/A', gaugeValue: 0 };
//         }

//         const raw = (Number(totalExpenses || 0) / netIncome) * 100;
//         // clamp between 0 and 100 for the gauge
//         const clamped = Math.max(0, Math.min(100, raw));
//         const rounded = Math.round(clamped);
//         return {
//             ratio: clamped,
//             display: `${rounded}%`,
//             gaugeValue: clamped,
//         };
//     }, [totalIncome, totalDeductions, totalExpenses]);

//     // color rule: green < 70, yellow 70-90, red > 90
//     const textColor = useMemo(() => {
//         if (ratio < 70) return theme.palette.success.main;
//         if (ratio <= 90) return theme.palette.warning.main;
//         return theme.palette.error.main;
//     }, [ratio, theme]);

//     return (
//         <Box
//             sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 width: '90%',
//                 maxWidth: 800,
//                 mx: 'auto',
//                 mt: -4
//             }}
//         >
//             {/* Gauge */}
//             <Box sx={{ width: 300, height: 300 }}>
//                 <GaugeContainer
//                     width={300}
//                     height={300}
//                     startAngle={-100}
//                     endAngle={100}
//                     value={gaugeValue}
//                     valueMin={0}
//                     valueMax={100}
//                     role="meter"
//                     aria-valuenow={Math.round(gaugeValue)}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                     aria-label="Spending ratio"
//                 >
//                     <GaugeReferenceArc />
//                     <GaugeValueArc skipAnimation={false} />
//                     <GaugePointer />
//                 </GaugeContainer>
//             </Box>

//             {/* Centered Text Underneath */}
//             <Typography
//                 variant="h6"
//                 sx={{ color: textColor, fontWeight: 600, textAlign: 'center', mt: -4}}
//             >
//                 You are spending {display} of your earned income
                
//             </Typography>
//             <Typography
//                 variant="subtitle1"
//                 color="text.secondary"
//                 sx={{ textAlign: 'center', mt: 1 }}
//             >
//                 Based on income, deductions, and expenses, you have ${netProfit} to save/invest
//             </Typography>
//         </Box>
//     );
// }

import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

/**
 * Props:
 * - totalIncome (number)
 * - totalDeductions (number)
 * - totalExpenses (number)
 *
 * Displays deductions, expenses, and remaining as slices of totalIncome.
 * Uses objects with `value` (required by MUI PieChart API).
 */
export default function SpendingGauge({
  totalIncome = 0,
  totalDeductions = 0,
  totalExpenses = 0,
}) {
  const theme = useTheme();

  const {
    totalIncomeNum,
    deductionsNum,
    expensesNum,
    remainingNum,
    percentSpent,
    display,
    series,
    netProfit,
  } = useMemo(() => {
    const totalIncomeNum = Number(totalIncome || 0);
    const deductionsNum = Math.max(0, Number(totalDeductions || 0));
    const expensesNum = Math.max(0, Number(totalExpenses || 0));

    const spent = deductionsNum + expensesNum;
    const remainingRaw = totalIncomeNum - spent;
    const remainingNum = Math.max(0, remainingRaw);

    const percentSpentRaw =
      totalIncomeNum > 0 && isFinite(totalIncomeNum)
        ? (spent / totalIncomeNum) * 100
        : NaN;

    const percentSpent = isFinite(percentSpentRaw)
      ? Math.round(percentSpentRaw)
      : null;

    const display = percentSpent === null ? 'N/A' : `${percentSpent}%`;

    // If income is invalid or zero, show a single neutral slice to avoid NaN
    if (!isFinite(totalIncomeNum) || totalIncomeNum <= 0) {
      return {
        totalIncomeNum,
        deductionsNum,
        expensesNum,
        remainingNum: 0,
        percentSpent: null,
        display: 'N/A',
        netProfit: NaN,
        series: [
          {
            // fallback neutral slice
            data: [{ id: 'no-income', value: 1, label: 'No income' }],
            innerRadius: '40%',
            outerRadius: '90%',
            paddingAngle: 3,
            cornerRadius: 4,
            startAngle: -100,
            endAngle: 100,
          },
        ],
      };
    }

    // create data objects with value + pct for arcLabel
    const data = [
      {
        id: 'deductions',
        label: 'Deductions',
        value: deductionsNum,
        pct: Math.round((deductionsNum / totalIncomeNum) * 100),
        raw: deductionsNum,
      },
      {
        id: 'expenses',
        label: 'Expenses',
        value: expensesNum,
        pct: Math.round((expensesNum / totalIncomeNum) * 100),
        raw: expensesNum,
      },
      {
        id: 'remaining',
        label: 'Remaining',
        value: remainingNum,
        pct: Math.round((remainingNum / totalIncomeNum) * 100),
        raw: remainingNum,
      },
    ];

    const series = [
      {
        data,
        // donut sizing
        innerRadius: '40%',
        outerRadius: '90%',
        paddingAngle: 3,
        cornerRadius: 4,
        // mimic your previous half-circle gauge if desired
        startAngle: -100,
        endAngle: 100,
        // arcLabel: use the precomputed pct so label shows percent
        arcLabel: (item) => `${item.pct}%`,
      },
    ];

    return {
      totalIncomeNum,
      deductionsNum,
      expensesNum,
      remainingNum,
      percentSpent,
      display,
      series,
      netProfit: totalIncomeNum - spent,
    };
  }, [totalIncome, totalDeductions, totalExpenses]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    []
  );

  // theme colors map to slices (same order as data array: deductions, expenses, remaining)
  const colors =
    totalIncome && totalIncome > 0
      ? [theme.palette.warning.main, theme.palette.error.main, theme.palette.success.main]
      : [theme.palette.grey[400]];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 800,
        height: '100%',
        mx: 'auto',
        mt: -4,
        mb: 1,
        pt: 0,
        pb: 0
      }}
    >
      <Box sx={{ width: 400, height: "100%"}}>
        <PieChart
          series={series}
          width={400}
          height={400}
          colors={colors}
          role="img"
          aria-label="Spending breakdown pie chart"
          skipAnimation={false}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color:
            percentSpent === null
              ? theme.palette.text.primary
              : percentSpent < 70
              ? theme.palette.success.main
              : percentSpent <= 90
              ? theme.palette.warning.main
              : theme.palette.error.main,
          fontWeight: 600,
          textAlign: 'center',
          mt: -18,
          pb: 0,
        }}
      >
        You are spending {display} of your Total Income
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
        Based on income, deductions, and expenses, you have{' '}
        {Number.isFinite(netProfit) ? formatter.format(netProfit) : 'N/A'} to save/invest
      </Typography>
    </Box>
  );
}
