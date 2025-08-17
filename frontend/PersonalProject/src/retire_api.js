import { api } from "./api";

export async function getPlan() {
    const response = await api.get('retire/');
    return response.data
}

export async function updatePlan(planData) {
    const response = await api.post('retire/', planData);
    return response.data
}

export async function getRetIncome() {
    const response = await api.get('retire/income/');
    return response.data
}

export async function postRetIncome(income) {
    const response = await api.post('retire/income/', income);
    return response.data
}

export async function deleteRetIncome(incomeId) {
    await api.delete(`retire/income/${incomeId}/`);
}

export async function postRetIncomeBulk(payloadArray) {
  const resp = await api.post("retire/income/bulk/", payloadArray);
  return resp.data; // this will be the refreshed list of incomes
}