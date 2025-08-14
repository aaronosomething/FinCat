import { api } from "./api";

// Assets

export async function getAssets() {
    const response = await api.get('networth/asset/');
    return response.data
}

export async function addAsset(assetData) {
    const response = await api.post('networth/asset/', assetData);
    return response.data
}

export async function deleteAsset(assetId) {
    await api.delete(`networth/asset/${assetId}/`);
}

// Liabilities

export async function getLiabilities() {
    const response = await api.get('networth/liability/');
    return response.data
}

export async function addLiability(liabilityData) {
    const response = await api.post('networth/liability/', liabilityData);
    return response.data
}

export async function deleteLiability(liabilityId) {
    await api.delete(`networth/liability/${liabilityId}/`);
}

// For the investments toggle
export async function getInvestmentsSum() {
  const response = await api.get("invest/sum/");
  const data = response.data;

  // handle possible shapes: number, { total_investment_value: N }, { total: N }, { sum: N }
  if (data === null || typeof data === "undefined") return 0;
  if (typeof data === "number") return data;

  if (typeof data === "object") {
    // try common keys
    const numeric =
      Number(data.total_investment_value ?? data.total ?? data.sum ?? data.value ?? 0);
    return isNaN(numeric) ? 0 : numeric;
  }

  // fallback: try coercion
  const maybe = Number(data);
  return isNaN(maybe) ? 0 : maybe;
}