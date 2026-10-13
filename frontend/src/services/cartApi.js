import axios from 'axios'

const api = axios.create({
  baseURL: '/cart',
  withCredentials: true,
})

export const getCart = () => api.get('/')

export const addToCart = (productId) => api.post(`/${productId}`)

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/${productId}`, { quantity })

export const removeFromCart = (productId) => api.delete(`/${productId}`)

export default api
