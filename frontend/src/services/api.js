import axios from 'axios'

const api = axios.create({
  baseURL: '/customers',
  withCredentials: true,
})

export const registerCustomer = (data) => api.post('/register', data)

export const loginCustomer = (data) => api.post('/login', data)

export const getCurrentCustomer = () => api.get('/me')

export const logoutCustomer = () => api.post('/logout')

export default api
