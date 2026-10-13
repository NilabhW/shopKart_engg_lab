const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home']

function SearchBar({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c === 'All Categories' ? '' : c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SearchBar
