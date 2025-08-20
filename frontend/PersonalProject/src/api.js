import axios from 'axios';


/** My API  */

const BASE_URL = "http://127.0.0.1:8000/api/";

// axios instance
export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})


export const registerUser = async (email, password) => {
  console.log("registerUser ->", { email });
  try {
    const response = await api.post("users/signup/", { email, password });
    console.log("registerUser response", response.status, response.data);

    // Treat 200/201 both as success (your backend returns 200 with { code: 'created' })
    if (response.status === 200 || response.status === 201) {
      return {
        ok: true,
        user: response.data?.user ?? null,
        code: response.data?.code ?? "created",
        raw: response.data,
        status: response.status,
      };
    }

    // Unexpected non-error response: return normalized failure
    return {
      ok: false,
      code: response.data?.code ?? "unknown",
      error: response.data?.error ?? "Signup failed",
      raw: response.data,
      status: response.status,
    };
  } catch (err) {
    console.warn("registerUser error", err);

    // If the server responded with JSON (our structured errors), normalize it
    const res = err?.response;
    if (res && res.data) {
      const data = res.data;
      return {
        ok: false,
        code: data?.code ?? "validation_error",
        error:
          data?.error ??
          (typeof data === "string" ? data : JSON.stringify(data)),
        raw: data,
        status: res.status,
      };
    }

    // Network / unexpected error
    return {
      ok: false,
      code: "network_error",
      error: err?.message ?? "Network error",
      raw: null,
      status: null,
    };
  }
};


export const loginUser = async (email, password) => {
    console.log("Request has reached the loginUser func in api.js and is passing", { email }, { password })
    const response = await api.post("users/login/", { email, password });
    console.log("request has made it back from the api")
    if (response.status === 200) {
        // const { user, token} = response.data;
        // localStorage.setItem("token", token);
        // api.defaults.headers.common["Authorization"] = `Token ${token}`
        return response.data.user;
    }

    // error case
    console.log('loginUser Error', response.data);
    return null;
}


export const logoutUser = async () => {
    // hit the logout endpoint
    console.log('logoutUser, api headers', api.defaults.headers.common)
    const response = await api.post("users/logout/")
    if (response.status === 204) {
        // delete token from localstorage
        localStorage.removeItem("token")
        // delete token from axios api instance
        delete api.defaults.headers.common["Authorization"];
        return null
    }

    console.log('logoutUser logout failed')
}


// Check if auth token exists clientside already UPDATE THIS
export const userConfirmation = async () => {
    try {
        console.log('userConfirmation()')
        const token = localStorage.getItem("token");
        if (token) {
            console.log('got token ', token)
            api.defaults.headers.common["Authorization"] = `Token ${token}`
        } else {
            delete api.defaults.headers.common["Authorization"];
        }
        // get basic user info and the default user data we want to display
        const response = await api.get("users/")
        if (response.status === 200) {
            console.log('made api call', response.data.user)
            return response.data.user ?? response.data;
        }
    } catch (err) {
        // ignore and return null
        console.warn('userConfirmation failed', err?.response?.status, err?.message);
    }
    return null;
};
