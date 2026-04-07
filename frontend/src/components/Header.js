import React from "react";
import { motion } from "framer-motion";

function Header({ isDark = false, onToggleTheme = () => {} }) {
  return (
    <header className="relative overflow-hidden bg-card border-b border-border sticky top-0 z-50">

      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>

      <div className="relative max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="text-gradient">Workshop</span>{" "}
            <span className="text-foreground">Booking</span>
          </h1>

          <p className="text-muted-foreground text-sm mt-1.5 font-medium">
            Discover and register for expert-led workshops
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          onClick={onToggleTheme}
          className={`theme-toggle ${isDark ? "active" : ""}`}
        >
          <span className="theme-toggle-knob flex items-center justify-center text-xs">
            {isDark ? "🌙" : "☀️"}
          </span>
        </motion.button>

      </div>
    </header>
  );
}

export default Header;