import { useState } from "react";

function App() {

  const [showForm, setShowForm] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const workshops = [
    { name: "AI Workshop", date: "10 April", seats: 5 },
    { name: "Web Development", date: "15 April", seats: 2 },
    { name: "Python Basics", date: "20 April", seats: 0 }
  ];

  const handleRegister = (workshop) => {
    setShowForm(true);
    setSelectedWorkshop(workshop);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!name || !email) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
    }, 1000);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSubmitted(false);
    setName("");
    setEmail("");
  };

  return (
    <div style={{
      fontFamily: "Arial",
      background: "linear-gradient(to right, #e0f2fe, #f0f9ff)",
      minHeight: "100vh"
    }}>
      
      {/* Navbar */}
      <div style={{
        background: "linear-gradient(to right, #1e293b, #0f172a)",
        color: "white",
        padding: "16px",
        fontSize: "22px",
        fontWeight: "bold",
        textAlign: "center"
      }}>
        Workshop Booking
      </div>

      {/* Main Section */}
      <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
        <h2 style={{ textAlign: "center", color: "#1e293b" }}>
          Available Workshops
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search workshops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
          
          {workshops
            .filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
            .map((workshop, index) => (
              <div 
                key={index}
                style={cardStyle}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <h3>{workshop.name}</h3>
                <p>Date: {workshop.date}</p>
                <p style={{ fontWeight: "bold" }}>
                  Seats left: {workshop.seats}
                </p>

                <button 
                  style={{
                    ...buttonStyle,
                    background: workshop.seats === 0
                      ? "#9ca3af"
                      : "linear-gradient(to right, #3b82f6, #2563eb)"
                  }}
                  disabled={workshop.seats === 0}
                  onClick={() => handleRegister(workshop.name)}
                >
                  {workshop.seats === 0 ? "Full" : "Register"}
                </button>
              </div>
            ))}

        </div>

        {/* FORM */}
        {showForm && (
          <div style={formStyle}>
            <h3>Book: {selectedWorkshop}</h3>

            <input 
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />

            <input 
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />

            <button style={submitStyle} onClick={handleSubmit}>
              {loading ? "Submitting..." : "Submit"}
            </button>

            <button style={cancelStyle} onClick={handleCancel}>
              Cancel
            </button>

            {submitted && (
              <div style={successStyle}>
                ✅ Booking Successful!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// 🎨 Styles
const cardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  transition: "0.3s",
  cursor: "pointer",
  borderLeft: "5px solid #3b82f6"
};

const buttonStyle = {
  marginTop: "10px",
  padding: "12px",
  width: "100%",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};

const formStyle = {
  marginTop: "30px",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const submitStyle = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(to right, #22c55e, #16a34a)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};

const cancelStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  background: "linear-gradient(to right, #ef4444, #dc2626)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};

const successStyle = {
  marginTop: "15px",
  padding: "12px",
  backgroundColor: "#d1fae5",
  borderRadius: "8px",
  textAlign: "center",
  fontWeight: "bold"
};

export default App;