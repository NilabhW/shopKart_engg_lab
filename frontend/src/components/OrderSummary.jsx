import { formatPrice } from '../utils/format'

// items: [{ name, price, quantity }] - used for both cart and order snapshots
function OrderSummary({ items, total, showLines = false, children }) {
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

      {showLines && (
        <ul className="space-y-2 mb-4 pb-4 border-b border-gray-100">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-4 text-sm">
              <span className="text-gray-700">
                {item.name} × {item.quantity}
              </span>
              <span className="text-gray-900 font-medium whitespace-nowrap">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Items</dt>
          <dd className="text-gray-900">{totalUnits}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold pt-2">
          <dt className="text-gray-900">{showLines ? 'Total' : 'Subtotal'}</dt>
          <dd className="text-gray-900">{formatPrice(total)}</dd>
        </div>
      </dl>

      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}

export default OrderSummary
