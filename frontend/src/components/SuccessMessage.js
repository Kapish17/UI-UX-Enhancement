import { motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

function SuccessMessage({ workshop }) {
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#0080ff", "#8b5cf6", "#ec4899"],
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#0080ff", "#8b5cf6", "#ec4899"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, []);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6 text-center mb-8 border border-border"
      style={{ background: "var(--gradient-primary)" }}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-4xl mb-2">🎉</p>

      <p className="text-lg font-bold text-primary-foreground">
        Successfully registered for {workshop}!
      </p>

      <p className="text-sm text-primary-foreground/70 mt-1">
        Check your email for confirmation details
      </p>
    </motion.div>
  );
}

export default SuccessMessage;