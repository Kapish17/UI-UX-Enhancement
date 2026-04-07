function SearchBar({ value, onChange }) {
  return (
    <div className="mb-5">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
          🔍
        </span>

        <input
          type="text"
          placeholder="Search workshops..."
          className="input-field pl-12"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search workshops"
        />
      </div>
    </div>
  );
}

export default SearchBar;