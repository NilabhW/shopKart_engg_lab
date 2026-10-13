import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoutCustomer } from '../services/api'
import { getWishlist } from '../services/wishlistApi'
import { useCart } from '../context/CartContext'

function Navbar() {
  const navigate = useNavigate()
  const [wishlistCount, setWishlistCount] = useState(null)
  // Read from the shared cart state - the Navbar never fetches the cart itself
  const { totalUnits, clearCart } = useCart()

  // useEffect(() => {
  //   const fetchCount = async () => {
  //     try {
  //       const res = await getWishlist()
  //       if (res.data && Array.isArray(res.data.wishlist)) {
  //         setWishlistCount(res.data.wishlist.length)
  //       }
  //     } catch {
  //       // If unauthenticated or error, ignore count
  //     }
  //   }

  //   fetchCount()
  // }, [])

  const handleLogout = async () => {
    try {
      await logoutCustomer()
    } finally {
      clearCart()
      navigate('/login')
    }
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-8">
        <Link to="/products" className="text-lg font-semibold text-gray-900">
          ShopKart
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <Link
            to="/wishlist"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <span>Wishlist</span>
            {wishlistCount !== null && (
              <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <span>Cart</span>
            <span className="bg-gray-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {totalUnits}
            </span>
          </Link>
          <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Orders
          </Link>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
      >
        Logout
      </button>
    </nav>
  )
}

export default Navbar
