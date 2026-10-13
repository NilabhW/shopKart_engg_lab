const STYLES = {
  PLACED: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPED: 'bg-amber-50 text-amber-700 border-amber-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING_PAYMENT: 'bg-gray-50 text-gray-600 border-gray-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-gray-50 text-gray-600 border-gray-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${
        STYLES[value] || STYLES.PENDING
      }`}
    >
      {value.replace('_', ' ')}
    </span>
  )
}

export default StatusBadge
