import { motion } from "framer-motion";

const items = [
  { icon: "📚", label: "Total Workshops", key: "totalWorkshops" },
  { icon: "✅", label: "Available Now", key: "availableWorkshops" },
  { icon: "💺", label: "Total Seats", key: "totalSeats" },
  { icon: "🏷️", label: "Categories", key: "categoriesCount" },
];

function StatisticsDashboard(props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          className="stat-card group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {item.icon}
          </div>

          <div>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">
              {props[item.key]}
            </p>

            <p className="text-xs text-muted-foreground font-medium tracking-wide">
              {item.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default StatisticsDashboard;