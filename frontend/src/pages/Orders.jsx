import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import OrderCard from '../components/OrderCard'
import { getOrders } from '../services/orderApi'

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getOrders()
      setOrders(res.data.orders || [])
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
        return
      }
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Orders</h1>

        {loading && (
          <p className="text-center text-gray-500 py-16 text-lg">Loading your orders...</p>
        )}

        {!loading && error && (
          <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to load your orders.</h2>
            <button
              onClick={fetchOrders}
              className="mt-4 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">You have not placed any orders yet.</h2>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
