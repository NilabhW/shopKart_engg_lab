import axios from 'axios'

const api = axios.create({
  baseURL: '/wishlist',
  withCredentials: true,
})

export const getWishlist = () => api.get('/')

export const addToWishlist = (productId) => api.post(`/${productId}`)

export const removeFromWishlist = (productId) => api.delete(`/${productId}`)

export const toggleWishlist = (productId) => api.patch(`/${productId}/toggle`)

export default api
