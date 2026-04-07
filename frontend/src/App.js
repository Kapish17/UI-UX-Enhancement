import { useState, useCallback, useMemo } from "react";

import Header from "./components/Header";
import StatisticsDashboard from "./components/StatisticsDashboard";
import SearchBar from "./components/SearchBar";
import FilterControls from "./components/FilterControls";
import SortControls from "./components/SortControls";
import WorkshopCard from "./components/WorkshopCard";
import WorkshopDetails from "./components/WorkshopDetails";
import RegistrationForm from "./components/RegistrationForm";
import SuccessMessage from "./components/SuccessMessage";
import Countdown from "./components/Countdown";
import Footer from "./components/Footer";

import useTheme from "./hooks/useTheme";

const workshops = [
  { name: "Introduction to AI & Machine Learning", date: "10 April, 2024", seats: 5, category: "AI" },
  { name: "Web Development with React", date: "15 April, 2024", seats: 2, category: "Web Development" },
  { name: "Python Fundamentals", date: "20 April, 2024", seats: 0, category: "Python" },
  { name: "Mobile App Development", date: "25 April, 2024", seats: 8, category: "Mobile" },
  { name: "Data Science Basics", date: "30 April, 2024", seats: 3, category: "Data Science" },
  { name: "Advanced Python Programming", date: "5 May, 2024", seats: 6, category: "Python" },
  { name: "Full Stack Development", date: "12 May, 2024", seats: 4, category: "Web Development" },
  { name: "Machine Learning Advanced", date: "18 May, 2024", seats: 1, category: "AI" },
];

function App() {
  const { isDark, toggle: toggleTheme } = useTheme();
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

  const categories = useMemo(() => {
    const cats = new Set(workshops.map((w) => w.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

  const filteredAndSortedWorkshops = useMemo(() => {
    let result = workshops.filter(
      (w) =>
        w.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedCategory === "All" || w.category === selectedCategory)
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case "date": return new Date(a.date) - new Date(b.date);
        case "date-latest": return new Date(b.date) - new Date(a.date);
        case "seats": return b.seats - a.seats;
        case "seats-least": return a.seats - b.seats;
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [search, selectedCategory, sortBy]);

  const stats = useMemo(() => ({
    totalWorkshops: workshops.length,
    availableWorkshops: workshops.filter((w) => w.seats > 0).length,
    totalSeats: workshops.reduce((sum, w) => sum + w.seats, 0),
    categoriesCount: new Set(workshops.map((w) => w.category)).size,
  }), []);

  const nextWorkshop = useMemo(() => {
    const now = new Date();
    return workshops
      .filter((w) => w.seats > 0 && new Date(w.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, []);

  const handleRegister = useCallback((workshopName) => {
    setShowForm(true);
    setSelectedWorkshop(workshopName);
    setSubmitted(false);
  }, []);

  const handleSubmit = useCallback(() => {
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
      const updated = prev.includes(workshopName)
        ? prev.filter((n) => n !== workshopName)
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
    <div className="min-h-screen flex flex-col">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main>
        <StatisticsDashboard {...stats} />

        {nextWorkshop && (
          <Countdown
            targetDate={nextWorkshop.date}
            label={`Next: ${nextWorkshop.name}`}
          />
        )}

        {submitted && <SuccessMessage workshop={selectedWorkshop} />}

        <SearchBar value={search} onChange={setSearch} />
        <FilterControls
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <SortControls sortBy={sortBy} onSortChange={setSortBy} />

        <div>
          {filteredAndSortedWorkshops.map((workshop, index) => (
            <WorkshopCard
              key={workshop.name}
              workshop={workshop}
              index={index}
              isInWishlist={wishlist.includes(workshop.name)}
              onRegister={handleRegister}
              onWishlistToggle={toggleWishlist}
              onShowDetails={showWorkshopDetails}
            />
          ))}
        </div>
      </main>

      {showDetails && selectedWorkshopDetails && (
        <WorkshopDetails
          workshop={selectedWorkshopDetails}
          onClose={() => setShowDetails(false)}
          isInWishlist={wishlist.includes(selectedWorkshopDetails.name)}
          onWishlistToggle={toggleWishlist}
          onRegister={handleRegister}
        />
      )}

      {showForm && (
        <RegistrationForm
          workshop={selectedWorkshop}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;