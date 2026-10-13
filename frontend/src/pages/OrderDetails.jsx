import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { getOrderById } from '../services/orderApi'
import { formatDate, formatPrice } from '../utils/format'

function OrderDetails() {
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
        setError(err.response?.data?.message || 'Unable to load this order.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-1 font-medium"
        >
          ← Back to My Orders
        </button>

        {loading && <p className="text-center text-gray-500 py-12">Loading order...</p>}

        {!loading && error && <p className="text-center text-red-500 py-12">{error}</p>}

        {!loading && order && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 break-all">Order #{order._id}</h1>
                  <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge value={order.status} />
                  <StatusBadge value={order.paymentStatus} />
                </div>
              </div>
              {order.razorpayPaymentId && (
                <p className="mt-3 text-xs text-gray-500 break-all">
                  Payment ID: {order.razorpayPaymentId}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
              <ul className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <li key={item.product} className="flex items-center gap-4 py-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-gray-100" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between pt-4 mt-2 border-t border-gray-100 font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Shipping Address</h2>
              <address className="not-italic text-sm text-gray-700 leading-6">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.addressLine1}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                <br />
                Phone: {order.shippingAddress.phone}
              </address>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
