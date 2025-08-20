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

export async function getMarketGains() {
  const CACHE_KEY = "marketGainsCache";
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  // Try to read cache
  let cached = null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      cached = JSON.parse(raw);
      // If cached object doesn't have expected shape, ignore it
      if (!cached || typeof cached !== "object" || !("timestamp" in cached) || !("data" in cached)) {
        cached = null;
      }
    }
  } catch (e) {
    // JSON parse error or localStorage error - ignore and proceed to fetch
    console.warn("Market gains cache read/parsing failed:", e);
    cached = null;
  }

  // If cache exists and is fresh, return it
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return cached.data;
  }

  // Otherwise fetch from server
  try {
    const response = await api.get('invest/market-gains/');
    const data = response.data;

    // Save to cache (best-effort)
    try {
      const toStore = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn("Failed to write market gains cache:", e);
    }

    return data;
  } catch (networkError) {
    // If network fails but we have any cached data (even stale), return it as a fallback
    if (cached && cached.data) {
      console.warn("Network fetch for market gains failed, returning stale cache:", networkError);
      return cached.data;
    }
    // No cache to fall back to — rethrow so caller can handle the error
    throw networkError;
  }
}