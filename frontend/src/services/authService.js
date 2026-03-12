import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'auth_token';
    this.USER_KEY = 'user_data';
  }

  async register(email, username, password, fullName, confirmPassword, country, organization, role, bio) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      username,
      password,
      confirm_password: confirmPassword,
      full_name: fullName,
      country,
      organization,
      role,
      bio
    });
    
    if (response.data.access_token) {
      this.setSession(response.data.access_token, response.data.user);
    }
    return response.data;
  }

  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    if (response.data.access_token) {
      this.setSession(response.data.access_token, response.data.user);
    }
    return response.data;
  }

  setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    // Also set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) return JSON.parse(userStr);
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic check - decode JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      // If token parsing fails, consider it invalid
      return false;
    }
  }

  // Initialize session on app load
  initializeAuth() {
    const token = this.getToken();
    if (token && this.isAuthenticated()) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

export default new AuthService();
