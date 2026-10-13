import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatDate, formatPrice } from '../utils/format'

function OrderCard({ order }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 break-all">Order #{order._id}</h3>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge value={order.status} />
      </div>

      <ul className="space-y-1 mb-4 text-sm text-gray-700">
        {order.items.map((item) => (
          <li key={item.product}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-900">
          Total: <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
        </p>
        <button
          onClick={() => navigate(`/orders/${order._id}`)}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default OrderCard
