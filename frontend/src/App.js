function App() {
  return (
    <div style={{ fontFamily: "Arial", backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      
      {/* Navbar */}
      <div style={{
        backgroundColor: "#1e293b",
        color: "white",
        padding: "15px",
        fontSize: "20px",
        textAlign: "center"
      }}>
        Workshop Booking
      </div>

      {/* Main Section */}
      <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
        <h2 style={{ textAlign: "center" }}>Available Workshops</h2>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
          
          {/* Card */}
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}>
            <h3>AI Workshop</h3>
            <p>Date: 10 April</p>
            <button style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}>
              Register
            </button>
          </div>

          {/* Card */}
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}>
            <h3>Web Development</h3>
            <p>Date: 15 April</p>
            <button style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}>
              Register
            </button>
          </div>

          {/* Card */}
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}>
            <h3>Python Basics</h3>
            <p>Date: 20 April</p>
            <button style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}>
              Register
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;