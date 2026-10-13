import { SHIPPING_FIELDS } from '../utils/shipping'

function CheckoutForm({ values, errors, onChange, disabled }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</h2>

      <div className="space-y-4">
        {SHIPPING_FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              inputMode={field.inputMode}
              autoComplete={field.autoComplete}
              value={values[field.name]}
              onChange={onChange}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 ${
                errors[field.name] ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CheckoutForm
