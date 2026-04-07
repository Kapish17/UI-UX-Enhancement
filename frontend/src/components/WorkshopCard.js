import { motion } from "framer-motion";

function WorkshopCard({
  workshop,
  index,
  isInWishlist,
  onRegister,
  onWishlistToggle,
  onShowDetails,
}) {
  const isAvailable = workshop.seats > 0;
  const seatPercent = Math.min(100, (workshop.seats / 10) * 100);

  const handleCardClick = (e) => {
    if (e.target.closest(".action-btn")) return;
    onShowDetails(workshop);
  };

  return (
    <motion.div
      className="workshop-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.5,
      }}
      onClick={handleCardClick}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <span className="badge badge-category text-[10px]">
              {workshop.category}
            </span>

            <h3 className="text-base font-bold mt-2 text-card-foreground leading-snug tracking-tight">
              {workshop.name}
            </h3>
          </div>

          <button
            className="action-btn ml-3 text-xl hover:scale-125 transition-transform duration-200 flex-shrink-0"
            onClick={() => onWishlistToggle(workshop.name)}
          >
            {isInWishlist ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span>📅 {workshop.date}</span>

          <span
            className={`badge text-[10px] ${
              isAvailable ? "badge-available" : "badge-full"
            }`}
          >
            {isAvailable ? `${workshop.seats} Seats` : "Full"}
          </span>
        </div>

        {/* Seats Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Seats</span>
            <span className="font-semibold text-foreground">
              {workshop.seats}/10
            </span>
          </div>

          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${seatPercent}%` }}
            />
          </div>
        </div>

        {/* Button */}
        <button
          className={`action-btn w-full text-sm py-2.5 rounded-xl font-semibold ${
            isAvailable ? "btn-primary" : "btn-ghost opacity-60"
          }`}
          onClick={() => onRegister(workshop.name)}
          disabled={!isAvailable}
        >
          {isAvailable ? "Register Now →" : "Fully Booked"}
        </button>
      </div>
    </motion.div>
  );
}

export default WorkshopCard;