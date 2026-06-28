import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // for sending cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    // We'll manage the token in memory or localStorage depending on setup
    // Assuming token is stored in localStorage for this implementation
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh and errors
api.interceptors.response.use(
  (response) => response.data, // Strip the axios wrapper, return the ApiResponse
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = refreshResponse.data.data.accessToken;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
        }

        // Retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, force logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          // Optionally redirect to login or emit an event
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Format error to match our ApiError backend structure
    const customError = {
      success: false,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors || [],
      status: error.response?.status,
    };

    return Promise.reject(customError);
  }
);

export default api;
