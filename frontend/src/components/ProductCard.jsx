import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addToWishlist, removeFromWishlist } from '../services/wishlistApi'
import { useCart } from '../context/CartContext'

function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const navigate = useNavigate()
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [cartMsg, setCartMsg] = useState('')
  const { addToCart, getItemQuantity, pendingItems } = useCart()

  useEffect(() => {
    setIsWishlisted(initialWishlisted)
  }, [initialWishlisted])

  const outOfStock = product.stock === 0
  const quantityInCart = getItemQuantity(product._id)
  const isAdding = pendingItems[product._id] === 'adding'
  const reachedStockLimit = quantityInCart >= product.stock

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (isAdding) return
    setCartMsg('')
    const result = await addToCart(product._id)
    if (!result.success) setCartMsg(result.message)
  }

  const handleWishlistToggle = async (e) => {
    e.stopPropagation()
    if (saving) return // Prevent duplicate clicks while saving

    setSaving(true)
    setErrorMsg('')

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id)
        setIsWishlisted(false)
        if (onWishlistChange) onWishlistChange(product._id, false)
      } else {
        await addToWishlist(product._id)
        setIsWishlisted(true)
        if (onWishlistChange) onWishlistChange(product._id, true)
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // Already in wishlist
        setIsWishlisted(true)
      } else {
        setErrorMsg('Unable to save product. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col relative group">
      {/* Top right quick wishlist heart button */}
      <button
        onClick={handleWishlistToggle}
        disabled={saving}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-rose-600 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
      >
        {saving ? (
          <span className="text-xs">⏳</span>
        ) : isWishlisted ? (
          <span className="text-lg">❤️</span>
        ) : (
          <span className="text-lg">🤍</span>
        )}
      </button>

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
        <p className="text-lg font-bold text-gray-900 mb-1">₹{product.price?.toLocaleString('en-IN')}</p>
        <p className={`text-sm mb-4 ${outOfStock ? 'text-red-500' : 'text-gray-500'}`}>
          {outOfStock ? 'Out of stock' : `${product.stock} units left`}
        </p>

        {errorMsg && (
          <p className="text-xs text-red-500 mb-2 font-medium">{errorMsg}</p>
        )}
        {cartMsg && (
          <p className="text-xs text-red-500 mb-2 font-medium">{cartMsg}</p>
        )}
        {quantityInCart > 0 && (
          <p className="text-xs text-emerald-700 mb-2 font-medium">{quantityInCart} in cart</p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || outOfStock || reachedStockLimit}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isAdding
              ? 'Adding...'
              : outOfStock
                ? 'Out of Stock'
                : reachedStockLimit
                  ? 'Max Stock in Cart'
                  : quantityInCart > 0
                    ? 'Add Another'
                    : 'Add to Cart'}
          </button>

          <button
            onClick={() => navigate(`/products/${product._id}`)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
          >
            View Details
          </button>

          <button
            onClick={handleWishlistToggle}
            disabled={saving}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md border transition-colors flex items-center justify-center gap-1.5 ${
              isWishlisted
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <>⏳ Saving...</>
            ) : isWishlisted ? (
              <>♥ Added to Wishlist</>
            ) : (
              <>♡ Add to Wishlist</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
