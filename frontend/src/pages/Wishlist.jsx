import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WishlistCard from '../components/WishlistCard'
import { getWishlist } from '../services/wishlistApi'

function Wishlist() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchWishlist = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getWishlist()
      if (res.data && res.data.wishlist) {
        setWishlist(res.data.wishlist)
      } else {
        setWishlist([])
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemoveItem = (removedId) => {
    setWishlist((prev) => prev.filter((item) => item._id !== removedId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Wishlist</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-500 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Loading your wishlist...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong.</h2>
            <p className="text-gray-500 text-sm mb-6">We couldn't load your wishlist.</p>
            <button
              onClick={fetchWishlist}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">❤️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">
              Save products you love and find them here later.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
