import { useState, useEffect } from "react";
import { X, Truck, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/islands/Toast";

const STORAGE_KEY = "announcement-dismissed-v2";

interface AnnouncementBarProps {
  message?: string;
}

export default function AnnouncementBar({
  message: initialMessage = "🚚 Envío GRATIS en pedidos superiores a 50€",
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string>(initialMessage);
  const [promoCoupon, setPromoCoupon] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check dismiss state
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (isDismissed) return;

    // 2. Fetch active promotion for announcement_top
    const fetchPromo = async () => {
      const { data: allPromos } = await supabase
        .from('promotions')
        .select('title, coupons(code), locations')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      const topPromo = allPromos?.find(p => 
        Array.isArray(p.locations) && p.locations.includes('announcement_top')
      );

      if (topPromo) {
        setPromoMessage(topPromo.title);
        
        // Handle coupons as object or array (Supabase join quirk)
        const couponData = topPromo.coupons;
        if (Array.isArray(couponData) && couponData.length > 0 && couponData[0]) {
           setPromoCoupon(couponData[0].code);
        } else if (couponData && typeof couponData === 'object' && 'code' in couponData) {
           // @ts-ignore
           setPromoCoupon(couponData.code);
        }
      }

      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    };

    fetchPromo();
  }, [initialMessage]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(STORAGE_KEY, "true");
    }, 300);
  };

  const copyCoupon = async () => {
    if (promoCoupon) {
      try {
        await navigator.clipboard.writeText(promoCoupon);
        toast.success(`¡Cupón ${promoCoupon} copiado al portapapeles!`);
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        toast.error('No se pudo copiar el código. Inténtalo manualmente.');
        console.error('Clipboard error:', err);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground text-center py-2 px-4 relative transition-all duration-300 z-50 ${
        isAnimating
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
      }`}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          {promoCoupon ? <Tag className="w-4 h-4" /> : <Truck className="w-4 h-4 hidden sm:block" />}
          <span className="text-sm font-medium tracking-wide">{promoMessage}</span>
        </div>

        {promoCoupon && (
          <button 
            onClick={copyCoupon}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-0.5 rounded-full text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Clic para copiar"
          >
            <span>{promoCoupon}</span>
            <span className="opacity-70 font-sans font-normal text-[10px] hidden sm:inline">COPIAR</span>
          </button>
        )}
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
