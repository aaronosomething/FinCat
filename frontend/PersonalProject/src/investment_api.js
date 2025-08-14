import { api } from "./api";

export async function getInvestments() {
    const response = await api.get('invest/');
    return response.data
}

export async function addInvestment(investmentData) {
    const response = await api.post('invest/', investmentData);
}

export async function deleteInvestment(investmentId){
    await api.delete(`invest/${investmentId}/`);
}

export async function updateInvestment(id, updatedData) {
  const response = await api.patch(`invest/${id}/`, updatedData);
  return response.data;
}