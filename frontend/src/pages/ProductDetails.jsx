import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getProductById } from '../services/productApi'
import { addToWishlist, getWishlist, removeFromWishlist } from '../services/wishlistApi'
import { useCart } from '../context/CartContext'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [wishlistError, setWishlistError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cartMsg, setCartMsg] = useState('')
  const { addToCart, getItemQuantity, pendingItems } = useCart()
  const quantityInCart = getItemQuantity(id)
  const isAdding = pendingItems[id] === 'adding'

  const handleAddToCart = async () => {
    if (isAdding) return
    setCartMsg('')
    const result = await addToCart(id)
    if (!result.success) setCartMsg(result.message)
  }

  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await getProductById(id)
        setProduct(res.data.product)

        // Fetch wishlist to check if current product is wishlisted
        try {
          const wishRes = await getWishlist()
          if (wishRes.data && Array.isArray(wishRes.data.wishlist)) {
            const found = wishRes.data.wishlist.some((item) => item._id === id)
            setIsWishlisted(found)
          }
        } catch {
          // ignore auth error
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchProductAndWishlist()
  }, [id])

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return
    setWishlistLoading(true)
    setWishlistError('')

    try {
      if (isWishlisted) {
        await removeFromWishlist(id)
        setIsWishlisted(false)
      } else {
        await addToWishlist(id)
        setIsWishlisted(true)
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setIsWishlisted(true)
      } else {
        setWishlistError('Unable to update wishlist. Please try again.')
      }
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/products')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-1 font-medium"
        >
          ← Back to Products
        </button>

        {loading && (
          <p className="text-center text-gray-500 py-12">Loading product...</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500 py-12">
            Something went wrong while loading this product.
          </p>
        )}

        {!loading && !error && product && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="h-80 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <p className="text-sm text-gray-500 mb-1">{product.category}</p>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                ₹{product.price?.toLocaleString('en-IN')}
              </p>
              <p className={`text-sm mb-6 ${product.stock === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {product.stock === 0 ? 'Out of stock' : `${product.stock} units left`}
              </p>

              {wishlistError && (
                <p className="text-xs text-red-500 mb-2 font-medium">{wishlistError}</p>
              )}

              <div className="mt-auto flex flex-col gap-3">
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`w-full px-4 py-3 text-sm font-medium rounded-md border transition-colors flex items-center justify-center gap-2 ${
                    isWishlisted
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {wishlistLoading ? (
                    <>⏳ Saving...</>
                  ) : isWishlisted ? (
                    <>♥ Added to Wishlist</>
                  ) : (
                    <>♡ Add to Wishlist</>
                  )}
                </button>

                {cartMsg && (
                  <p className="text-xs text-red-500 font-medium">{cartMsg}</p>
                )}
                {quantityInCart > 0 && (
                  <p className="text-xs text-emerald-700 font-medium">{quantityInCart} in cart</p>
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock === 0 || quantityInCart >= product.stock}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isAdding
                    ? 'Adding...'
                    : product.stock === 0
                      ? 'Out of Stock'
                      : quantityInCart >= product.stock
                        ? 'Max Stock in Cart'
                        : quantityInCart > 0
                          ? 'Add Another'
                          : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails
