import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ate_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('ate_token')
      localStorage.removeItem('ate_token')
      localStorage.removeItem('ate-auth-user')
      // Only bounce to login if the user was authed and hit a protected route
      if (hadToken && !window.location.pathname.startsWith('/login')) {
        const path = window.location.pathname
        if (path.startsWith('/shop') || path.startsWith('/api')) {
          // stay; shop will prompt login
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
