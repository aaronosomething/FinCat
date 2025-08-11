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