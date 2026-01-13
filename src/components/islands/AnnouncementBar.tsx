import { useState, useEffect } from "react";
import { X, Truck } from "lucide-react";

const STORAGE_KEY = "announcement-bar-dismissed";

interface AnnouncementBarProps {
  message?: string;
}

export default function AnnouncementBar({
  message = "🚚 Envío GRATIS en pedidos superiores a 50€",
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the bar before
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      setIsVisible(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(STORAGE_KEY, "true");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground text-center py-2 px-4 relative transition-all duration-300 ${
        isAnimating
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
      }`}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Truck className="w-4 h-4 hidden sm:block" />
        <span className="text-sm font-medium">{message}</span>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Cerrar anuncio"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
