/* ====================================================
   SHOPSPHERE - API CLIENT WRAPPER
   ==================================================== */

const API_BASE_URL = '/api';

class APIClient {
  static getToken() {
    return localStorage.getItem('shopsphere_token') || null;
  }

  static getHeaders(isJSON = true) {
    const headers = {};
    if (isJSON) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = this.getHeaders(options.body && !(options.body instanceof FormData));
    
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An unexpected server error occurred');
      }

      return data;
    } catch (error) {
      console.error(`API Request Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  static put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
