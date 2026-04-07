import { useState, useCallback, useMemo } from "react";
import "./App.css";

// ============ Reusable Components ============

const Header = () => (
  <header className="app-header">
    <div className="app-header-content">
      <h1 className="app-title">Workshop Booking</h1>
      <p className="app-subtitle">Discover and register for expert-led workshops</p>
    </div>
  </header>
);

const WorkshopCard = ({ workshop, onRegister, index, isInWishlist, onWishlistToggle, onShowDetails }) => {
  const isAvailable = workshop.seats > 0;
  const availabilityText = isAvailable
    ? `${workshop.seats} seat${workshop.seats !== 1 ? 's' : ''} available`
    : 'No seats available';

  const handleCardClick = (e) => {
    if (e.target.closest(".wishlist-button")) return;
    onShowDetails(workshop);
  };

  return (
    <article className="workshop-card" onClick={handleCardClick}>
      <div className="workshop-header">
        <div>
          <span className="workshop-category-badge">{workshop.category}</span>
          <h2 className="workshop-name">{workshop.name}</h2>
        </div>
        <div className="workshop-card-actions">
          <button
            className="wishlist-button"
            onClick={() => onWishlistToggle(workshop.name)}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist ? "❤️" : "🤍"}
          </button>
          <span className="workshop-badge" aria-label={`${workshop.seats} seats`}>
            {isAvailable ? `${workshop.seats} Seats` : "Full"}
          </span>
        </div>
      </div>

      <div className="workshop-details">
        <div className="detail-item">
          <span className="detail-label">📅 Date</span>
          <span className="detail-value">{workshop.date}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">👥 Availability</span>
          <span className="detail-value">{availabilityText}</span>
        </div>
      </div>

      <div className="seats-info">
        <div className="seats-label">Seats Available</div>
        <div className="seats-count">{isAvailable ? workshop.seats : "0"}</div>
      </div>

      <button
        className={`button button-primary ${!isAvailable ? 'disabled' : ''}`}
        onClick={() => onRegister(workshop.name)}
        disabled={!isAvailable}
        aria-label={`Register for ${workshop.name}`}
      >
        {isAvailable ? "Register Now" : "Fully Booked"}
      </button>
    </article>
  );
};

const FilterControls = ({ categories, selectedCategory, onCategoryChange }) => (
  <div className="filter-container">
    <label htmlFor="category-filter" className="filter-label">📂 Filter by Category:</label>
    <div className="filter-buttons">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`filter-button ${selectedCategory === cat ? 'active' : ''}`}
          onClick={() => onCategoryChange(cat)}
          aria-pressed={selectedCategory === cat}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);

const SortControls = ({ sortBy, onSortChange }) => (
  <div className="sort-container">
    <label htmlFor="sort-select" className="sort-label">↕️ Sort by:</label>
    <select
      id="sort-select"
      className="sort-select"
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value)}
      aria-label="Sort workshops"
    >
      <option value="date">Date (Earliest First)</option>
      <option value="date-latest">Date (Latest First)</option>
      <option value="seats">Seats Available (Most First)</option>
      <option value="seats-least">Seats Available (Least First)</option>
      <option value="name">Name (A-Z)</option>
    </select>
  </div>
);

const SearchBar = ({ value, onChange }) => (
  <div className="search-container">
    <input
      type="search"
      className="search-input"
      placeholder="Search workshops by name..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search workshops"
    />
  </div>
);

const RegistrationForm = ({ workshop, onSubmit, onCancel, loading }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ name: name.trim(), email: email.trim() });
      setName("");
      setEmail("");
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Register for Workshop</h2>
      <p style={{ color: "var(--neutral-600)", marginBottom: "var(--spacing-lg)" }}>
        {workshop}
      </p>

      <div className="form-group">
        <label htmlFor="name" className="form-label required">Full Name</label>
        <input
          id="name"
          type="text"
          className="form-input"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
          minLength={2}
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label required">Email Address</label>
        <input
          id="email"
          type="email"
          className="form-input"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        {errors.email && <p className="error-message">{errors.email}</p>}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className={`button button-success ${loading ? 'loading' : ''}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Registering..." : "Confirm Registration"}
        </button>
        <button
          type="button"
          className="button button-danger"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const SuccessMessage = ({ workshop }) => (
  <div className="success-message" role="status" aria-live="polite">
    <div style={{ fontSize: "1.5rem", marginBottom: "var(--spacing-sm)" }}>✅</div>
    <div>Successfully registered for <strong>{workshop}</strong>!</div>
    <div style={{ fontSize: "0.85rem", marginTop: "var(--spacing-sm)", opacity: 0.9 }}>
      Check your email for confirmation details
    </div>
  </div>
);

const WorkshopDetails = ({ workshop, onClose, isInWishlist, onWishlistToggle, onRegister }) => (
  <div className="details-modal">
    <div className="details-content">
      <button className="details-close" onClick={onClose} aria-label="Close">✕</button>

      <div className="details-header">
        <div>
          <span className="details-category">{workshop.category}</span>
          <h2 className="details-title">{workshop.name}</h2>
        </div>
        <button
          className="details-wishlist"
          onClick={() => onWishlistToggle(workshop.name)}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="details-info">
        <div className="info-item">
          <span className="info-label">📅 Date</span>
          <span className="info-value">{workshop.date}</span>
        </div>
        <div className="info-item">
          <span className="info-label">💺 Available Seats</span>
          <span className="info-value">{workshop.seats > 0 ? `${workshop.seats} seats` : "No seats available"}</span>
        </div>
      </div>

      <div className="details-description">
        <h3 className="details-subtitle">About This Workshop</h3>
        <p>
          Join our {workshop.category} workshop on {workshop.date}. This expert-led session will provide hands-on experience
          and in-depth knowledge to help you master the skills needed in today's technology landscape.
        </p>
        <p style={{ marginTop: "var(--spacing-md)" }}>
          <strong>What you'll learn:</strong>
        </p>
        <ul style={{ paddingLeft: "var(--spacing-lg)" }}>
          <li>Industry best practices and standards</li>
          <li>Practical implementation techniques</li>
          <li>Real-world problem-solving strategies</li>
          <li>Networking opportunities with experts</li>
        </ul>
      </div>

      <div className="details-actions">
        <button
          className="button button-primary"
          onClick={() => {
            onRegister(workshop.name);
            onClose();
          }}
          disabled={workshop.seats === 0}
        >
          {workshop.seats > 0 ? "Register Now" : "Fully Booked"}
        </button>
        <button
          className="button button-danger"
          onClick={onClose}
          style={{ background: "var(--neutral-200)", color: "var(--neutral-800)" }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const StatisticsDashboard = ({ totalWorkshops, availableWorkshops, totalSeats, categoriesCount }) => (
  <div className="statistics-dashboard">
    <div className="stat-card">
      <div className="stat-icon">📚</div>
      <div className="stat-info">
        <div className="stat-value">{totalWorkshops}</div>
        <div className="stat-label">Total Workshops</div>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon">✅</div>
      <div className="stat-info">
        <div className="stat-value">{availableWorkshops}</div>
        <div className="stat-label">Available Now</div>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon">💺</div>
      <div className="stat-info">
        <div className="stat-value">{totalSeats}</div>
        <div className="stat-label">Total Seats</div>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon">🏷️</div>
      <div className="stat-info">
        <div className="stat-value">{categoriesCount}</div>
        <div className="stat-label">Categories</div>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <p>&copy; 2024 Workshop Booking Platform. All rights reserved.</p>
      <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "var(--spacing-sm)" }}>
        For inquiries, contact: workshops@example.com
      </p>
    </div>
  </footer>
);

// ============ Main App Component ============

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("workshopWishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedWorkshopDetails, setSelectedWorkshopDetails] = useState(null);

  const workshops = useMemo(() => [
    { name: "Introduction to AI & Machine Learning", date: "10 April, 2024", seats: 5, category: "AI" },
    { name: "Web Development with React", date: "15 April, 2024", seats: 2, category: "Web Development" },
    { name: "Python Fundamentals", date: "20 April, 2024", seats: 0, category: "Python" },
    { name: "Mobile App Development", date: "25 April, 2024", seats: 8, category: "Mobile" },
    { name: "Data Science Basics", date: "30 April, 2024", seats: 3, category: "Data Science" },
    { name: "Advanced Python Programming", date: "5 May, 2024", seats: 6, category: "Python" },
    { name: "Full Stack Development", date: "12 May, 2024", seats: 4, category: "Web Development" },
    { name: "Machine Learning Advanced", date: "18 May, 2024", seats: 1, category: "AI" }
  ], []);

  const categories = useMemo(() => {
    const cats = new Set(workshops.map(w => w.category));
    return ["All", ...Array.from(cats).sort()];
  }, [workshops]);

  const filteredAndSortedWorkshops = useMemo(() => {
    let result = workshops.filter(w =>
      w.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === "All" || w.category === selectedCategory)
    );

    // Apply sorting
    result.sort((a, b) => {
      switch(sortBy) {
        case "date":
          return new Date(a.date) - new Date(b.date);
        case "date-latest":
          return new Date(b.date) - new Date(a.date);
        case "seats":
          return b.seats - a.seats;
        case "seats-least":
          return a.seats - b.seats;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [workshops, search, selectedCategory, sortBy]);

  const stats = useMemo(() => {
    const totalWorkshops = workshops.length;
    const availableWorkshops = workshops.filter(w => w.seats > 0).length;
    const totalSeats = workshops.reduce((sum, w) => sum + w.seats, 0);
    const categoriesCount = new Set(workshops.map(w => w.category)).size;

    return { totalWorkshops, availableWorkshops, totalSeats, categoriesCount };
  }, [workshops]);

  const handleRegister = useCallback((workshopName) => {
    setShowForm(true);
    setSelectedWorkshop(workshopName);
    setSubmitted(false);
  }, []);

  const handleSubmit = useCallback(({ name, email }) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setShowForm(false);
    }, 1000);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setSubmitted(false);
    setSelectedWorkshop("");
  }, []);

  const toggleWishlist = useCallback((workshopName) => {
    setWishlist((prev) => {
      const isInWishlist = prev.includes(workshopName);
      const updated = isInWishlist
        ? prev.filter(name => name !== workshopName)
        : [...prev, workshopName];
      localStorage.setItem("workshopWishlist", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const showWorkshopDetails = useCallback((workshop) => {
    setSelectedWorkshopDetails(workshop);
    setShowDetails(true);
  }, []);

  return (
    <div className="app">
      <Header />

      <main className="app-content">
        <div className="main-container">
          <StatisticsDashboard
            totalWorkshops={stats.totalWorkshops}
            availableWorkshops={stats.availableWorkshops}
            totalSeats={stats.totalSeats}
            categoriesCount={stats.categoriesCount}
          />

          {submitted && <SuccessMessage workshop={selectedWorkshop} />}

          <section className="section-header">
            <h2 className="section-title">Available Workshops</h2>
            <p className="section-subtitle">
              {filteredAndSortedWorkshops.length} workshop{filteredAndSortedWorkshops.length !== 1 ? 's' : ''} available
            </p>
          </section>

          <SearchBar value={search} onChange={setSearch} />

          <FilterControls
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <SortControls
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="workshops-grid">
            {filteredAndSortedWorkshops.length > 0 ? (
              filteredAndSortedWorkshops.map((workshop, index) => (
                <WorkshopCard
                  key={`${workshop.name}-${index}`}
                  workshop={workshop}
                  onRegister={handleRegister}
                  index={index}
                  isInWishlist={wishlist.includes(workshop.name)}
                  onWishlistToggle={toggleWishlist}
                  onShowDetails={showWorkshopDetails}
                />
              ))
            ) : (
              <div style={{
                padding: "var(--spacing-2xl)",
                textAlign: "center",
                color: "var(--neutral-500)",
                background: "white",
                borderRadius: "var(--border-radius-lg)"
              }}>
                <p style={{ fontSize: "1.1rem", marginBottom: "var(--spacing-md)" }}>
                  No workshops found
                </p>
                <p style={{ fontSize: "0.95rem" }}>
                  Try adjusting your search or check back later for new workshops
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showDetails && selectedWorkshopDetails && (
        <div className="modal-backdrop" onClick={() => setShowDetails(false)} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()}>
            <WorkshopDetails
              workshop={selectedWorkshopDetails}
              onClose={() => setShowDetails(false)}
              isInWishlist={wishlist.includes(selectedWorkshopDetails.name)}
              onWishlistToggle={toggleWishlist}
              onRegister={handleRegister}
            />
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={handleCancel} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()}>
            <RegistrationForm
              workshop={selectedWorkshop}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;