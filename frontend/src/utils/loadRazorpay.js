const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

// Resolves true once window.Razorpay is available, false if the script fails to load.
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SRC
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => {
      script.remove()
      resolve(false)
    }
    document.body.appendChild(script)
  })
