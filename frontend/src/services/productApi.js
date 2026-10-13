import axios from 'axios'

const api = axios.create({
  baseURL: '/products',
  withCredentials: true,
})

export const getProducts = (params) => api.get('/', { params })

export const getProductById = (id) => api.get(`/${id}`)

export const createProduct = (data) => api.post('/', data)

export default api
