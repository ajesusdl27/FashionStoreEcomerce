import { useState, useEffect } from "react";
import { X, Truck, Tag, ExternalLink } from "lucide-react";
import { toast } from "@/components/islands/Toast";
import { getPromotionsForZone } from "@/stores/promotionsCache";
import { resolveStyleConfig, getTextColorClass, getTextAlignClass, getAnnouncementBgClass, normalizeCoupon } from "@/lib/types/promotion";

const STORAGE_KEY_PREFIX = "announcement-dismissed-";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string>("");
  const [promoDescription, setPromoDescription] = useState<string | null>(null);
  const [promoCoupon, setPromoCoupon] = useState<string | null>(null);
  const [promoId, setPromoId] = useState<string | null>(null);
  const [ctaText, setCtaText] = useState<string | null>(null);
  const [ctaLink, setCtaLink] = useState<string | null>(null);
  const [textColorClass, setTextColorClass] = useState("text-white");
  const [textAlignClass, setTextAlignClass] = useState("text-center items-center");
  const [bgClass, setBgClass] = useState("bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900");

  useEffect(() => {
    const fetchPromo = async () => {
      const promos = await getPromotionsForZone('announcement_top');
      const topPromo = promos[0];

      if (!topPromo) return;

      // Check dismiss state for this specific promotion
      const isDismissed = localStorage.getItem(`${STORAGE_KEY_PREFIX}${topPromo.id}`);
      if (isDismissed) return;

      setPromoId(topPromo.id);
      setPromoMessage(topPromo.title);

      // Description (truncated single line)
      if (topPromo.description) {
        setPromoDescription(topPromo.description);
      }

      // CTA
      if (topPromo.cta_text && topPromo.cta_link) {
        setCtaText(topPromo.cta_text);
        setCtaLink(topPromo.cta_link);
      }

      // Coupon — normalised for array/object Supabase quirk
      const coupon = normalizeCoupon(topPromo.coupons);
      if (coupon) setPromoCoupon(coupon.code);

      // Style config — honour admin settings
      const style = resolveStyleConfig(topPromo.style_config);
      setTextColorClass(getTextColorClass(style.text_color));
      setTextAlignClass(getTextAlignClass(style.text_align));
      setBgClass(getAnnouncementBgClass(style));

      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    };

    fetchPromo();
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (promoId) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${promoId}`, "true");
      }
    }, 300);
  };

  const copyCoupon = async () => {
    if (promoCoupon) {
      try {
        await navigator.clipboard.writeText(promoCoupon);
        toast.success(`¡Cupón ${promoCoupon} copiado al portapapeles!`);
      } catch (err) {
        toast.error('No se pudo copiar el código. Inténtalo manualmente.');
        console.error('Clipboard error:', err);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${bgClass} ${textColorClass} py-2 px-4 transition-all duration-300 ${
        isAnimating
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
      }`}
    >
      <div className={`container mx-auto flex flex-col sm:flex-row ${textAlignClass} justify-center gap-2 sm:gap-4`}>
        <div className="flex items-center gap-2">
          {promoCoupon ? <Tag className="w-4 h-4 flex-shrink-0" /> : <Truck className="w-4 h-4 hidden sm:block flex-shrink-0" />}
          <span className="font-display text-sm font-medium tracking-wide uppercase">{promoMessage}</span>
          {promoDescription && (
            <span className="hidden md:inline text-sm opacity-80 ml-1">— {promoDescription}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
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

          {ctaText && ctaLink && (
            <a
              href={ctaLink}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-3 py-0.5 rounded-full text-xs font-medium transition-colors"
            >
              {ctaText}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
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
