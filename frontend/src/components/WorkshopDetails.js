import { motion, AnimatePresence } from "framer-motion";

function WorkshopDetails({
  workshop,
  onClose,
  isInWishlist,
  onWishlistToggle,
  onRegister,
}) {
  const seatPercent = Math.min(100, (workshop.seats / 10) * 100);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content max-w-xl max-h-[85vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.35 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: "var(--gradient-primary)" }}
          />

          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="badge badge-category text-[10px]">
                  {workshop.category}
                </span>

                <h2 className="text-2xl font-extrabold mt-2 text-card-foreground tracking-tight">
                  {workshop.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="text-xl hover:scale-125 transition-transform duration-200"
                  onClick={() => onWishlistToggle(workshop.name)}
                >
                  {isInWishlist ? "❤️" : "🤍"}
                </button>

                <button
                  className="text-muted-foreground hover:text-foreground text-lg transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"
                  onClick={onClose}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  📅 Date
                </p>

                <p className="font-bold text-sm text-card-foreground mt-1">
                  {workshop.date}
                </p>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  💺 Seats
                </p>

                <p className="font-bold text-sm text-card-foreground mt-1">
                  {workshop.seats > 0
                    ? `${workshop.seats} available`
                    : "Sold out"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Capacity</span>

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

            <div className="mb-6">
              <h3 className="text-base font-bold text-card-foreground mb-2">
                About This Workshop
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Join our {workshop.category} workshop on {workshop.date}. This
                expert-led session provides hands-on experience and in-depth
                knowledge for today's tech landscape.
              </p>

              <p className="text-sm font-semibold text-card-foreground mb-2">
                What you'll learn:
              </p>

              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Industry best practices and standards
                </li>

                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Practical implementation techniques
                </li>

                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Real-world problem-solving strategies
                </li>

                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Networking opportunities with experts
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-primary flex-1 text-sm"
                onClick={() => {
                  onRegister(workshop.name);
                  onClose();
                }}
                disabled={workshop.seats === 0}
              >
                {workshop.seats > 0 ? "Register Now →" : "Fully Booked"}
              </button>

              <button className="btn-ghost text-sm" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WorkshopDetails;