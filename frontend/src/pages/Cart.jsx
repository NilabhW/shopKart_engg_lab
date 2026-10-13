import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartItem from '../components/CartItem'
import OrderSummary from '../components/OrderSummary'
import { useCart } from '../context/CartContext'

function Cart() {
  const navigate = useNavigate()
  const { cartItems, loading, error, unauthorized, subtotal, refreshCart } = useCart()

  // Re-sync shared state with the server so latest prices and stock are shown
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  if (unauthorized) return <Navigate to="/login" replace />

  const hasStockIssue = cartItems.some((item) => item.quantity > item.product.stock)
  const showLoading = loading && cartItems.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Cart</h1>

        {showLoading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Loading your cart...</p>
          </div>
        )}

        {!showLoading && error && cartItems.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to load your cart.</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={refreshCart}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!showLoading && !error && cartItems.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Looks like you haven&apos;t added anything yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            <div>
              <OrderSummary
                items={cartItems.map((item) => ({
                  key: item.product._id,
                  name: item.product.name,
                  price: item.product.price,
                  quantity: item.quantity,
                }))}
                total={subtotal}
              >
                {hasStockIssue && (
                  <p className="text-xs text-red-500 font-medium mb-3">
                    Some items exceed available stock. Update them to continue.
                  </p>
                )}
                {error && (
                  <p className="text-xs text-red-500 font-medium mb-3">{error}</p>
                )}
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={hasStockIssue}
                  className="w-full py-3 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </OrderSummary>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
