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

const WorkshopCard = ({ workshop, onRegister, index }) => {
  const isAvailable = workshop.seats > 0;
  const availabilityText = isAvailable
    ? `${workshop.seats} seat${workshop.seats !== 1 ? 's' : ''} available`
    : 'No seats available';

  return (
    <article className="workshop-card">
      <div className="workshop-header">
        <h2 className="workshop-name">{workshop.name}</h2>
        <span className="workshop-badge" aria-label={`${workshop.seats} seats`}>
          {isAvailable ? `${workshop.seats} Seats` : "Full"}
        </span>
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

  const workshops = useMemo(() => [
    { name: "Introduction to AI & Machine Learning", date: "10 April, 2024", seats: 5 },
    { name: "Web Development with React", date: "15 April, 2024", seats: 2 },
    { name: "Python Fundamentals", date: "20 April, 2024", seats: 0 },
    { name: "Mobile App Development", date: "25 April, 2024", seats: 8 },
    { name: "Data Science Basics", date: "30 April, 2024", seats: 3 }
  ], []);

  const filteredWorkshops = useMemo(() =>
    workshops.filter(w => w.name.toLowerCase().includes(search.toLowerCase())),
    [workshops, search]
  );

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

  return (
    <div className="app">
      <Header />

      <main className="app-content">
        <div className="main-container">
          {submitted && <SuccessMessage workshop={selectedWorkshop} />}

          <section className="section-header">
            <h2 className="section-title">Available Workshops</h2>
            <p className="section-subtitle">
              {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? 's' : ''} available
            </p>
          </section>

          <SearchBar value={search} onChange={setSearch} />

          <div className="workshops-grid">
            {filteredWorkshops.length > 0 ? (
              filteredWorkshops.map((workshop, index) => (
                <WorkshopCard
                  key={`${workshop.name}-${index}`}
                  workshop={workshop}
                  onRegister={handleRegister}
                  index={index}
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
