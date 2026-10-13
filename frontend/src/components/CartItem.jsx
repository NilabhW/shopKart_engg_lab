import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

function CartItem({ item }) {
  const navigate = useNavigate()
  const { updateQuantity, removeFromCart, pendingItems } = useCart()
  const [errorMsg, setErrorMsg] = useState('')

  const { product, quantity } = item
  const pending = pendingItems[product._id]
  const busy = Boolean(pending)
  const overStock = quantity > product.stock
  const outOfStock = product.stock === 0

  const runAction = async (action) => {
    if (busy) return
    setErrorMsg('')
    const result = await action()
    if (!result.success) setErrorMsg(result.message)
  }

  // If stock dropped below the cart quantity, "-" brings it down to what is available
  const handleDecrease = () =>
    runAction(() => updateQuantity(product._id, overStock ? product.stock : quantity - 1))

  const handleIncrease = () => runAction(() => updateQuantity(product._id, quantity + 1))

  const handleRemove = () => runAction(() => removeFromCart(product._id))

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <button
        onClick={() => navigate(`/products/${product._id}`)}
        className="w-full sm:w-32 h-32 shrink-0 bg-gray-100 rounded-md overflow-hidden"
      >
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </button>

      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{formatPrice(product.price)} each</p>
            <p className={`text-xs mt-1 ${outOfStock || overStock ? 'text-red-500' : 'text-gray-400'}`}>
              {outOfStock
                ? 'Out of stock — please remove this item'
                : overStock
                  ? `Only ${product.stock} left — please reduce quantity`
                  : `${product.stock} in stock`}
            </p>
          </div>
          <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
            {formatPrice(product.price * quantity)}
          </p>
        </div>

        <div className="mt-auto pt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={handleDecrease}
              disabled={busy || outOfStock || (!overStock && quantity <= 1)}
              aria-label="Decrease quantity"
              className="px-3 py-1.5 text-lg leading-none text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="min-w-10 text-center text-sm font-semibold text-gray-900">
              {pending === 'updating' ? '…' : quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={busy || quantity >= product.stock}
              aria-label="Increase quantity"
              className="px-3 py-1.5 text-lg leading-none text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={busy}
            className="px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            {pending === 'removing' ? 'Removing...' : 'Remove'}
          </button>
        </div>

        {errorMsg && <p className="mt-2 text-xs text-red-500 font-medium">{errorMsg}</p>}
      </div>
    </div>
  )
}

export default CartItem
