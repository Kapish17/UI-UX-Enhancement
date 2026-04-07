function SortControls({ sortBy, onSortChange }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Sort
      </span>

      <select
        className="input-field w-auto text-sm py-2.5 pr-10"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort workshops"
      >
        <option value="date">Date (Earliest)</option>
        <option value="date-latest">Date (Latest)</option>
        <option value="seats">Seats (Most)</option>
        <option value="seats-least">Seats (Least)</option>
        <option value="name">Name (A-Z)</option>
      </select>
    </div>
  );
}

export default SortControls;