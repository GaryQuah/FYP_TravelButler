export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("access_token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}