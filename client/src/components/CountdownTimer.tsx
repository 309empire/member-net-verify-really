import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: number; // Unix timestamp in milliseconds or seconds
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    // Handle both seconds & milliseconds timestamps
    const baseTime = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt;

    // ✅ countdown duration = 30 minutes
    const targetTime = baseTime + 30 * 60 * 1000;

    // ✅ progress duration also 30 minutes
    const initialDuration = 30 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        setPercent(0);
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

      // progress percentage
      setPercent(Math.min(100, Math.max(0, (diff / initialDuration) * 100)));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isLowTime = timeLeft.startsWith("00:");

  return (
    <div
      className={`
      flex items-center justify-center gap-2 px-4 py-2 rounded-full
      bg-black/20 border border-white/5 backdrop-blur-sm
      transition-colors duration-300
      ${isLowTime ? "text-red-400 border-red-500/20 bg-red-500/10" : "text-muted-foreground"}
    `}
    >
      <Clock className={`w-4 h-4 ${isLowTime ? "animate-pulse" : ""}`} />
      <span className="font-mono text-sm tracking-widest">{timeLeft}</span>
    </div>
  );
}
