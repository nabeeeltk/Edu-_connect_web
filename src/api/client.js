// Axios-like lightweight API client using fetch
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getToken() {
  return localStorage.getItem('educonnect_token');
}

async function request(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get:    (endpoint)        => request('GET', endpoint),
  post:   (endpoint, body)  => request('POST', endpoint, body),
  patch:  (endpoint, body)  => request('PATCH', endpoint, body),
  put:    (endpoint, body)  => request('PUT', endpoint, body),
  delete: (endpoint)        => request('DELETE', endpoint),
};

export default api;
