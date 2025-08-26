import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  IconButton,
  useMediaQuery,
  TextField,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import AddRemToggle from '../components/AddRemToggle';
import SpendingGauge from '../components/SpendingGauge';
import {
  getIncome,
  addIncome,
  deleteIncome,
  getExpenses,
  addExpense,
  deleteExpense,
  getDeductions,
  addDeduction,
  deleteDeduction,
} from '../budget_api';

export default function BudgetPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  // State for modes
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // State for income
  const [income, setIncome] = useState([]);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');

  // State for deductions
  const [deductions, setDeductions] = useState([]);
  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState('');

  // State for expenses
  const [expenses, setExpenses] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Refs to measure heights
  const incomePaperRef = useRef(null);
  const deductionsPaperRef = useRef(null);

  // expenseMinHeight (string like '500px' or 'auto')
  const [expenseMinHeight, setExpenseMinHeight] = useState('auto');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIncome(await getIncome());
    setExpenses(await getExpenses());
    setDeductions(await getDeductions());
  };

  // --- INCOME handlers ---
  const handleAddIncome = async () => {
    if (!newIncomeName.trim() || !newIncomeAmount) return;
    await addIncome({ name: newIncomeName, amount: parseFloat(newIncomeAmount) });
    setNewIncomeName('');
    setNewIncomeAmount('');
    loadAll();
  };

  const handleDeleteIncome = async (id) => {
    await deleteIncome(id);
    loadAll();
  };

  // --- DEDUCTION handlers ---
  const handleAddDeduction = async () => {
    if (!newDeductionName.trim() || !newDeductionAmount) return;
    await addDeduction({ name: newDeductionName, amount: parseFloat(newDeductionAmount) });
    setNewDeductionName('');
    setNewDeductionAmount('');
    loadAll();
  };

  const handleDeleteDeduction = async (id) => {
    await deleteDeduction(id);
    loadAll();
  };

  // --- EXPENSE handlers ---
  const handleAddExpense = async () => {
    if (!newExpenseName.trim() || !newExpenseAmount) return;
    await addExpense({ name: newExpenseName, amount: parseFloat(newExpenseAmount) });
    setNewExpenseName('');
    setNewExpenseAmount('');
    loadAll();
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    loadAll();
  };

  // --- Totals ---
  const totalIncome = income.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // Measure heights and set expenseMinHeight when on md+
  useEffect(() => {
    if (!isMdUp) {
      setExpenseMinHeight('auto');
      return;
    }

    const gapPx = theme.spacing(2); // parent gap: 2 -> spacing * 2
    const updateHeight = () => {
      const incH = incomePaperRef.current?.offsetHeight || 0;
      const dedH = deductionsPaperRef.current?.offsetHeight || 0;
      const total = incH + dedH + gapPx;
      // set a small minimum to avoid weird 0px situations
      setExpenseMinHeight(`${Math.max(total, 200)}px`);
    };

    // Initial measurement
    updateHeight();

    // Observe size changes on the two papers
    const ro = new ResizeObserver(() => updateHeight());
    if (incomePaperRef.current) ro.observe(incomePaperRef.current);
    if (deductionsPaperRef.current) ro.observe(deductionsPaperRef.current);

    // Also update on window resize and mode/list changes
    window.addEventListener('resize', updateHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
    // Re-run when these change (list content may change heights)
  }, [income, deductions, isRemoveMode, isMdUp, theme]);

  // --- Render list items ---
  const renderList = (items, onDelete) => (
    <>
      {items.map(item => (
        <Box
          key={item.id}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
          sx={{
            width: '100%',
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
          >
            {item.name}
          </Typography>

          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
              ml: 1,
            }}
          >
            <Typography>${item.amount}</Typography>
            {isRemoveMode && (
              <IconButton onClick={() => onDelete(item.id)} size="small" aria-label="delete">
                <Delete />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
    </>
  );

  // Render add form; inputs are controlled responsive widths to prevent expanding the paper
  const renderAddForm = (nameVal, setName, amtVal, setAmt, onAdd) => (
    <Box
      mt={2}
      display="flex"
      gap={1}
      sx={{
        flexWrap: 'wrap',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <TextField
        placeholder="Name"
        value={nameVal}
        onChange={e => setName(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          width: { xs: '100%', sm: 160 },
          flexShrink: 0,
        }}
      />
      <TextField
        placeholder="Amount"
        type="number"
        value={amtVal}
        onChange={e => setAmt(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          width: { xs: '100%', sm: 120 },
          flexShrink: 0,
        }}
      />
      <Button
        onClick={onAdd}
        variant="contained"
        sx={{
          height: 40,
          flexShrink: 0,
        }}
      >
        Add
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        p: 1,
        pl: 0,
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gridTemplateAreas: {
          xs: `
            "header"
            "income"
            "deductions"
            "expenses"
            "chart"
            "footer"
          `,
          md: `
            "header header"
            "income expenses"
            "deductions expenses"
            "deductions chart"
            "footer footer"
          `,
        },
        // Ensure container doesn't allow children to force overflow horizontally
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <Box sx={{ gridArea: 'header' }}>
        <Typography variant="h4" mb={2}>Budget</Typography>
        <AddRemToggle isRemove={isRemoveMode} onClick={() => setIsRemoveMode(!isRemoveMode)} />
      </Box>

      {/* Income */}
      <Box sx={{ gridArea: 'income' }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            boxSizing: 'border-box',
            width: '100%',
            minHeight: isMdUp ? undefined : 'auto',
          }}
          ref={incomePaperRef}
        >
          <Typography variant="h6" mb={2}>Income</Typography>
          {renderList(income, handleDeleteIncome)}
          <Typography variant="subtitle1" mt={2}>Total: ${totalIncome.toFixed(2)}</Typography>
          {isRemoveMode && renderAddForm(newIncomeName, setNewIncomeName, newIncomeAmount, setNewIncomeAmount, handleAddIncome)}
        </Paper>
      </Box>

      {/* Deductions */}
      <Box sx={{ gridArea: 'deductions' }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            boxSizing: 'border-box',
            width: '100%',
            minHeight: isMdUp ? undefined : 'auto',
          }}
          ref={deductionsPaperRef}
        >
          <Typography variant="h6" mb={2}>Deductions</Typography>
          {renderList(deductions, handleDeleteDeduction)}
          <Typography variant="subtitle1" mt={2}>Total: ${totalDeductions.toFixed(2)}</Typography>
          {isRemoveMode && renderAddForm(newDeductionName, setNewDeductionName, newDeductionAmount, setNewDeductionAmount, handleAddDeduction)}
        </Paper>
      </Box>

      {/* Expenses */}
      <Box sx={{ gridArea: 'expenses' }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            boxSizing: 'border-box',
            width: '100%',
            // apply the computed minHeight only on md+
            minHeight: isMdUp ? expenseMinHeight : 'auto',
            // allow internal scrolling if content is larger than minHeight
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" mb={2}>Expenses</Typography>
          {renderList(expenses, handleDeleteExpense)}
          <Typography variant="subtitle1" mt={2}>Total: ${totalExpenses.toFixed(2)}</Typography>
          {isRemoveMode && renderAddForm(newExpenseName, setNewExpenseName, newExpenseAmount, setNewExpenseAmount, handleAddExpense)}
        </Paper>
      </Box>

      {/* Chart */}
      <Box sx={{ gridArea: 'chart', display: 'flex', textAlign: 'center', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            pt: 0,
            boxSizing: 'border-box',
            width: '100%',
            // apply the computed minHeight only on md+
            minHeight: isMdUp ? expenseMinHeight : 'auto',
            // allow internal scrolling if content is larger than minHeight
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SpendingGauge
            totalIncome={Number(totalIncome) | 0}
            totalDeductions={Number(totalDeductions) | 0}
            totalExpenses={Number(totalExpenses) | 0}
          />
        </Paper>
      </Box>
    </Box>
  );
}
