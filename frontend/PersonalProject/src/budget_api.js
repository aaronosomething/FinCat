import { api } from './api';

// --- INCOME ---

export async function getIncome() {
  const response = await api.get('budget/income/');
  return response.data;
}

export async function addIncome(incomeData) {
  const response = await api.post('budget/income/', incomeData);
  return response.data;
}

export async function deleteIncome(incomeId) {
  await api.delete(`budget/income/${incomeId}/`);
}

// --- EXPENSE ---

export async function getExpenses() {
  const response = await api.get('budget/expenses/');
  return response.data;
}

export async function addExpense(expenseData) {
  const response = await api.post('budget/expenses/', expenseData);
  return response.data;
}

export async function deleteExpense(expenseId) {
  await api.delete(`budget/expenses/${expenseId}/`);
}

// --- DEDUCTION ---

export async function getDeductions() {
  const response = await api.get('budget/deductions/');
  return response.data;
}

export async function addDeduction(deductionData) {
  const response = await api.post('budget/deductions/', deductionData);
  return response.data;
}

export async function deleteDeduction(deductionId) {
  await api.delete(`budget/deductions/${deductionId}/`);
}