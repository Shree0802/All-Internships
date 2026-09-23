/* ====================================================
   SHOPSPHERE - AUTHENTICATION & USER SESSION MANAGER
   ==================================================== */

class Auth {
  static getUser() {
    const userStr = localStorage.getItem('shopsphere_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user, token) {
    if (user) localStorage.setItem('shopsphere_user', JSON.stringify(user));
    if (token) localStorage.setItem('shopsphere_token', token);
  }

  static clearUser() {
    localStorage.removeItem('shopsphere_user');
    localStorage.removeItem('shopsphere_token');
  }

  static isLoggedIn() {
    return !!this.getUser();
  }

  static async register(name, email, password, phone = '') {
    try {
      const data = await APIClient.post('/auth/register', { name, email, password, phone });
      if (data.success) {
        this.setUser(data.user, data.token);
        Toast.success('Account created successfully! Welcome to ShopSphere.');
        return data;
      }
    } catch (error) {
      Toast.error(error.message || 'Registration failed');
      throw error;
    }
  }

  static async login(email, password) {
    try {
      const data = await APIClient.post('/auth/login', { email, password });
      if (data.success) {
        this.setUser(data.user, data.token);
        Toast.success(`Welcome back, ${data.user.name}!`);
        return data;
      }
    } catch (error) {
      Toast.error(error.message || 'Login failed');
      throw error;
    }
  }

  static async logout() {
    try {
      await APIClient.post('/auth/logout', {});
    } catch (e) {
      // Ignore network logout errors
    } finally {
      this.clearUser();
      Toast.success('Logged out successfully');
      window.location.href = '/login';
    }
  }

  static async fetchProfile() {
    try {
      const data = await APIClient.get('/auth/profile');
      if (data.success) {
        localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (error) {
      this.clearUser();
      return null;
    }
  }

  static requireAuth() {
    if (!this.isLoggedIn()) {
      Toast.warning('Please log in to access this page.');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }
    return true;
  }
}
