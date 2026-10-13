import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/productApi'
import { getWishlist } from '../services/wishlistApi'

function Products() {
  const [products, setProducts] = useState([])
  const [wishlistIds, setWishlistIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fetch wishlist once to know which items are saved
  useEffect(() => {
    const fetchUserWishlist = async () => {
      try {
        const res = await getWishlist()
        if (res.data && res.data.wishlist) {
          const ids = new Set(res.data.wishlist.map((item) => item._id))
          setWishlistIds(ids)
        }
      } catch {
        // Ignore auth or wishlist fetch errors on product listing page
      }
    }
    fetchUserWishlist()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fetchProducts = async () => {
        setLoading(true)
        setError(false)
        try {
          const params = {}
          if (search) params.search = search
          if (category) params.category = category

          const res = await getProducts(params)
          setProducts(res.data.products)
        } catch {
          setError(true)
        } finally {
          setLoading(false)
        }
      }

      fetchProducts()
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, category])

  const handleWishlistChange = (productId, isSaved) => {
    setWishlistIds((prev) => {
      const next = new Set(prev)
      if (isSaved) {
        next.add(productId)
      } else {
        next.delete(productId)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Products</h1>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {loading && (
          <p className="text-center text-gray-500 py-12">Loading products...</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500 py-12">
            Something went wrong while loading products.
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-500 py-12">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialWishlisted={wishlistIds.has(product._id)}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
