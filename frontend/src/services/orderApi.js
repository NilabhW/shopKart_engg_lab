import axios from 'axios'

const api = axios.create({
  baseURL: '/orders',
  withCredentials: true,
})

// Only the shipping address is sent - the server rebuilds items and total from the cart
export const createPaymentOrder = (shippingAddress) =>
  api.post('/create-payment-order', { shippingAddress })

export const verifyPayment = (data) => api.post('/verify-payment', data)

export const getOrders = () => api.get('/')

export const getOrderById = (id) => api.get(`/${id}`)

export default api
