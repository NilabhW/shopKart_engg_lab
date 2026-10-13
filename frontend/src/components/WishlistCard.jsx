import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeFromWishlist } from '../services/wishlistApi'

function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate()
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState(false)

  const outOfStock = product.stock === 0

  const handleRemove = async () => {
    if (removing) return
    setRemoving(true)
    setError(false)
    try {
      await removeFromWishlist(product._id)
      if (onRemove) {
        onRemove(product._id)
      }
    } catch {
      setError(true)
      setRemoving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        <p className="text-lg font-bold text-gray-900 mb-1">
          ₹{product.price?.toLocaleString('en-IN')}
        </p>
        <p className={`text-sm mb-4 ${outOfStock ? 'text-red-500' : 'text-gray-500'}`}>
          {outOfStock ? 'Out of stock' : `${product.stock} units left`}
        </p>

        {error && (
          <p className="text-xs text-red-500 mb-2 font-medium">
            Could not remove product. Try again.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={() => navigate(`/products/${product._id}`)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="w-full px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {removing ? '⏳ Removing...' : 'Remove ♥'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WishlistCard
