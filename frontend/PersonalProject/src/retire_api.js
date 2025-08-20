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

export async function getInflationData() {
    const CACHE_KEY = "inflationData";
    const CACHE_DATE_KEY = "inflationDataDate";

    // Check localStorage for cached value
    const cachedValue = localStorage.getItem(CACHE_KEY);
    const cachedDate = localStorage.getItem(CACHE_DATE_KEY);

    if (cachedValue && cachedDate) {
        const now = new Date();
        const lastFetched = new Date(cachedDate);

        // Check if less than 1 month old
        const diffMonths =
            (now.getFullYear() - lastFetched.getFullYear()) * 12 +
            (now.getMonth() - lastFetched.getMonth());

        if (diffMonths < 1) {
            // Still fresh, return cached value
            return { average_value: parseFloat(cachedValue) };
        }
    }

    // Otherwise, fetch from backend
    const resp = await api.get("retire/inflation/");
    const { average_value } = resp.data;

    // Save to localStorage
    localStorage.setItem(CACHE_KEY, average_value);
    localStorage.setItem(CACHE_DATE_KEY, new Date().toISOString());

    return { average_value };
}