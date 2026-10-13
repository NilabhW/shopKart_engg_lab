import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import OrderSummary from '../components/OrderSummary'
import CheckoutForm from '../components/CheckoutForm'
import { EMPTY_ADDRESS, validateShippingAddress } from '../utils/shipping'
import { useCart } from '../context/CartContext'
import { createPaymentOrder, verifyPayment } from '../services/orderApi'
import { loadRazorpayScript } from '../utils/loadRazorpay'
import { formatPrice } from '../utils/format'

const STEP_LABELS = {
  preparing: 'Creating order...',
  paying: 'Waiting for payment...',
  verifying: 'Verifying payment...',
}

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, loading, error: cartError, unauthorized, subtotal, refreshCart, clearCart } = useCart()

  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [fieldErrors, setFieldErrors] = useState({})
  const [step, setStep] = useState('') // '' | 'preparing' | 'paying' | 'verifying'
  const [errorMsg, setErrorMsg] = useState('')

  // Always review the latest cart (prices / stock) before paying
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  if (unauthorized) return <Navigate to="/login" replace />

  const busy = Boolean(step)
  const hasStockIssue = cartItems.some((item) => item.quantity > item.product.stock)

  const handleChange = (e) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleVerify = async (shopKartOrderId, response) => {
    setStep('verifying')
    try {
      await verifyPayment({
        shopKartOrderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      })
      // Backend has cleared the cart; mirror that in global state -> Navbar shows Cart (0)
      navigate(`/order-success/${shopKartOrderId}`, { replace: true })
      clearCart()
    } catch (err) {
      setErrorMsg(
        `${err.response?.data?.message || 'Payment verification failed.'} Your cart has not been cleared.`
      )
      setStep('')
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const errors = validateShippingAddress(address)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return // no backend call on invalid input

    setStep('preparing')

    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      setErrorMsg('Unable to load Razorpay Checkout. Please check your connection and try again.')
      setStep('')
      return
    }

    const shippingAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [key, value.trim()])
    )

    let data
    try {
      const res = await createPaymentOrder(shippingAddress)
      data = res.data
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
        return
      }
      setErrorMsg(err.response?.data?.message || 'Unable to place order. Please try again.')
      setStep('')
      // Stock or price may have changed - pull the latest cart
      refreshCart()
      return
    }

    let paymentFailed = false

    const razorpay = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'ShopKart',
      description: 'ShopKart Order',
      order_id: data.razorpayOrderId,
      // Not proof of payment - the backend verifies the signature
      handler: (response) => handleVerify(data.shopKartOrderId, response),
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
      },
      theme: { color: '#111827' },
      modal: {
        ondismiss: () => {
          setStep('')
          if (!paymentFailed) {
            setErrorMsg('Payment was cancelled. Your cart has not been cleared.')
          }
        },
      },
    })

    razorpay.on('payment.failed', (response) => {
      paymentFailed = true
      const reason = response.error?.description ? ` (${response.error.description})` : ''
      setErrorMsg(`Payment failed${reason}. Your cart has not been cleared. Please try again.`)
    })

    setStep('paying')
    razorpay.open()
  }

  const showLoading = loading && cartItems.length === 0 && !busy

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Checkout</h1>

        {showLoading && (
          <p className="text-center text-gray-500 py-16 text-lg">Loading your cart...</p>
        )}

        {!showLoading && cartError && cartItems.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to load your cart.</h2>
            <button
              onClick={refreshCart}
              className="mt-4 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!showLoading && !cartError && cartItems.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Add some products before checking out.</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}

        {cartItems.length > 0 && (
          <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <CheckoutForm values={address} errors={fieldErrors} onChange={handleChange} disabled={busy} />
            </div>

            <div className="lg:col-span-2">
              <OrderSummary
                showLines
                items={cartItems.map((item) => ({
                  key: item.product._id,
                  name: item.product.name,
                  price: item.product.price,
                  quantity: item.quantity,
                }))}
                total={subtotal}
              >
                {hasStockIssue && (
                  <p className="text-sm text-red-600 mb-3">
                    Some items exceed available stock. Please update your cart.
                  </p>
                )}
                {errorMsg && (
                  <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy || hasStockIssue}
                  className="w-full py-3 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {busy ? STEP_LABELS[step] : `Place Order · Pay ${formatPrice(subtotal)}`}
                </button>
                <p className="mt-3 text-xs text-gray-400 text-center">
                  Payments are processed by Razorpay (Test Mode). Final amount is calculated by the server.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  disabled={busy}
                  className="mt-3 w-full py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Back to Cart
                </button>
              </OrderSummary>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Checkout
