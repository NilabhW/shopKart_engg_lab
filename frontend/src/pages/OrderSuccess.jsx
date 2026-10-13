import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { getOrderById } from '../services/orderApi'
import { formatPrice } from '../utils/format'

function OrderSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await getOrderById(id)
        setOrder(res.data.order)
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login')
          return
        }
        setError(err.response?.data?.message || 'Unable to load your order.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, navigate])

  const isPaid = order?.paymentStatus === 'PAID'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        {loading && <p className="text-center text-gray-500 py-12">Loading order...</p>}

        {!loading && error && (
          <p className="text-center text-red-500 py-12">{error}</p>
        )}

        {!loading && order && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-5xl mb-4">{isPaid ? '✅' : '⏳'}</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              {isPaid ? 'Order Placed Successfully' : 'Payment Not Completed'}
            </h1>

            <dl className="space-y-4 text-left mb-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                <dd className="text-base text-gray-900 break-all">{order._id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total</dt>
                <dd className="text-base text-gray-900">{formatPrice(order.totalAmount)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1"><StatusBadge value={order.status} /></dd>
              </div>
              {order.razorpayPaymentId && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                  <dd className="text-sm text-gray-900 break-all">{order.razorpayPaymentId}</dd>
                </div>
              )}
            </dl>

            <p className="text-sm text-gray-500 mb-6">
              {isPaid
                ? 'Your order has been saved successfully.'
                : 'This order has not been paid. Your cart has not been cleared.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderSuccess
