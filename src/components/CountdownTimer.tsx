import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  onComplete?: () => void;
}

export const getLaunchTimestamp = (): number => {
  let ts = localStorage.getItem("bethebest_launch_timestamp");
  if (!ts) {
    ts = new Date().toISOString();
    localStorage.setItem("bethebest_launch_timestamp", ts);
  }
  return new Date(ts).getTime();
};

export const resetLaunchTimestamp = (offsetHours: number) => {
  const newDate = new Date(Date.now() - offsetHours * 60 * 60 * 1000);
  localStorage.setItem("bethebest_launch_timestamp", newDate.toISOString());
  window.dispatchEvent(new Event("storage"));
  window.location.reload();
};

export default function CountdownTimer({ onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const launchTime = getLaunchTimestamp();
    const targetTime = launchTime + 48 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setTimeLeft(0);
        if (onComplete) {
          onComplete();
        }
      } else {
        setTimeLeft(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Listen to localstorage or custom events to reset live
    const handleStorageChange = () => {
      updateTimer();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [onComplete]);

  if (timeLeft <= 0) {
    return null;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const totalHours = days * 24 + hours;

  // Determine text color based on remaining time
  let textColorClass = "text-amber-500"; // Default
  if (timeLeft < 1 * 60 * 60 * 1000) {
    textColorClass = "text-rose-500 font-bold animate-pulse"; // Last hour: turn red
  } else if (timeLeft < 12 * 60 * 60 * 1000) {
    textColorClass = "text-blue-500 font-semibold"; // Less than 12 hours: turn blue
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-1.5 py-1 text-center">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        Coming in
      </span>
      <div className={`font-mono text-xs sm:text-sm tracking-tight ${textColorClass} flex items-center justify-center space-x-1 bg-white/40 border border-white/50 py-1.5 px-3 rounded-xl shadow-sm`}>
        {days > 0 && (
          <>
            <span>{days}</span>
            <span className="text-[9px] text-slate-400 uppercase font-sans mr-1">d</span>
          </>
        )}
        <span>{hours.toString().padStart(2, "0")}</span>
        <span className="text-[9px] text-slate-400 uppercase font-sans mr-1">h</span>
        <span>{minutes.toString().padStart(2, "0")}</span>
        <span className="text-[9px] text-slate-400 uppercase font-sans mr-1">m</span>
        <span className="w-5 text-center inline-block">{seconds.toString().padStart(2, "0")}</span>
        <span className="text-[9px] text-slate-400 uppercase font-sans">s</span>
      </div>
    </div>
  );
}
