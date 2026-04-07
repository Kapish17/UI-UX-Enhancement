import { useState, useEffect } from "react";

function Countdown({ targetDate, label }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };

    tick();

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { val: timeLeft.days, label: "Days" },
    { val: timeLeft.hours, label: "Hrs" },
    { val: timeLeft.mins, label: "Min" },
    { val: timeLeft.secs, label: "Sec" },
  ];

  return (
    <div className="glass-card p-5 mb-8">
      <p className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide uppercase">
        ⏰ {label}
      </p>

      <div className="flex gap-3">
        {units.map((u) => (
          <div key={u.label} className="flex-1 text-center">
            <div className="text-2xl md:text-3xl font-bold text-gradient tabular-nums">
              {String(u.val).padStart(2, "0")}
            </div>

            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-medium">
              {u.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Countdown;