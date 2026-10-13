export const SHIPPING_FIELDS = [
  { name: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', inputMode: 'numeric' },
  { name: 'addressLine1', label: 'Address', type: 'text', autoComplete: 'address-line1' },
  { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
  { name: 'state', label: 'State', type: 'text', autoComplete: 'address-level1' },
  { name: 'pincode', label: 'Pincode', type: 'text', autoComplete: 'postal-code', inputMode: 'numeric' },
]

export const EMPTY_ADDRESS = SHIPPING_FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})

// Returns an object of field -> error message. Empty object means valid.
export const validateShippingAddress = (values) => {
  const errors = {}

  for (const field of SHIPPING_FIELDS) {
    if (!values[field.name].trim()) {
      errors[field.name] = `${field.label} is required.`
    }
  }

  if (!errors.phone && !/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = 'Phone number must contain 10 digits.'
  }

  if (!errors.pincode && !/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = 'Pincode must contain 6 digits.'
  }

  return errors
}
