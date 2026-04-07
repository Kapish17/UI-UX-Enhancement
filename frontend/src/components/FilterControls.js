function FilterControls({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">
        Filter by Category
      </p>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className="filter-chip"
            onClick={() => onCategoryChange(cat)}
            aria-pressed={selectedCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterControls;