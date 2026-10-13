import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as cartApi from '../services/cartApi'

const CartContext = createContext(null)

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message || fallback

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [unauthorized, setUnauthorized] = useState(false)
  // Per-item loading state, keyed by productId: 'adding' | 'updating' | 'removing'
  const [pendingItems, setPendingItems] = useState({})

  // Every server response gets a sequence number so a slow, older response
  // can never overwrite a newer cart.
  const requestSeq = useRef(0)
  const appliedSeq = useRef(0)

  const applyServerCart = useCallback((seq, cart) => {
    if (seq < appliedSeq.current) return
    appliedSeq.current = seq
    setCartItems(Array.isArray(cart) ? cart : [])
    setUnauthorized(false)
  }, [])

  const setItemPending = (productId, status) => {
    setPendingItems((prev) => {
      const next = { ...prev }
      if (status) next[productId] = status
      else delete next[productId]
      return next
    })
  }

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      setUnauthorized(true)
      setCartItems([])
      return true
    }
    return false
  }

  const refreshCart = useCallback(async () => {
    const seq = ++requestSeq.current
    setLoading(true)
    setError(null)
    try {
      const res = await cartApi.getCart()
      applyServerCart(seq, res.data.cart)
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(getErrorMessage(err, 'Unable to load your cart.'))
      }
    } finally {
      setLoading(false)
    }
  }, [applyServerCart])

  // Shared runner for add / update / remove. Returns { success, message }.
  const runMutation = async (productId, status, request, fallbackMessage) => {
    const seq = ++requestSeq.current
    setItemPending(productId, status)
    try {
      const res = await request()
      applyServerCart(seq, res.data.cart)
      return { success: true, message: res.data.message }
    } catch (err) {
      if (handleAuthError(err)) {
        return { success: false, message: 'Please log in to manage your cart.' }
      }
      return { success: false, message: getErrorMessage(err, fallbackMessage) }
    } finally {
      setItemPending(productId, null)
    }
  }

  const addToCart = (productId) =>
    runMutation(productId, 'adding', () => cartApi.addToCart(productId), 'Unable to add to cart.')

  const updateQuantity = (productId, quantity) =>
    runMutation(
      productId,
      'updating',
      () => cartApi.updateCartQuantity(productId, quantity),
      'Unable to update quantity.'
    )

  const removeFromCart = (productId) =>
    runMutation(productId, 'removing', () => cartApi.removeFromCart(productId), 'Unable to remove item.')

  // Local reset used after a verified payment (backend already cleared it) and on logout
  const clearCart = useCallback(() => {
    appliedSeq.current = ++requestSeq.current
    setCartItems([])
    setError(null)
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Derived values - never stored, always computed from cartItems
  const { totalUnits, itemCount, subtotal } = useMemo(() => {
    let units = 0
    let total = 0
    for (const item of cartItems) {
      units += item.quantity
      total += item.product.price * item.quantity
    }
    return {
      totalUnits: units,
      itemCount: cartItems.length,
      subtotal: Math.round(total * 100) / 100,
    }
  }, [cartItems])

  const getItemQuantity = useCallback(
    (productId) => cartItems.find((item) => item.product._id === productId)?.quantity || 0,
    [cartItems]
  )

  const value = {
    cartItems,
    loading,
    error,
    unauthorized,
    pendingItems,
    totalUnits,
    itemCount,
    subtotal,
    getItemQuantity,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider')
  }
  return context
}
