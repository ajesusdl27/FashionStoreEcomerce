import { useEffect, useState } from 'react';
import { getPromotionsForZone } from '@/stores/promotionsCache';
import { toast } from '@/components/islands/Toast';
import { resolveStyleConfig, getTextColorClass, getTextAlignClass, getContentPositionClasses, getOverlayClasses, normalizeCoupon, type Promotion } from '@/lib/types/promotion';

interface PromotionBannerProps {
  zone: string;
  className?: string;
  compact?: boolean; // Use compact layout for small spaces
}

export default function PromotionBanner({ zone, className = '', compact = false }: PromotionBannerProps) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        // Use shared cache - no redundant Supabase queries
        const validPromotions = await getPromotionsForZone(zone);

        if (validPromotions.length > 0) {
          setPromotion(validPromotions[0] as Promotion);
        }
      } catch (e) {
        console.error('Exception fetching promotion:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [zone]);

  if (loading || !promotion) return null;

  const { title, description, image_url, mobile_image_url, cta_text, cta_link } = promotion;
  const styleConfig = resolveStyleConfig(promotion.style_config);
  const coupon = normalizeCoupon(promotion.coupons);
  
  // Use mobile image if available and on mobile device
  const displayImage = (isMobile && mobile_image_url) ? mobile_image_url : image_url;
  
  const textColor = getTextColorClass(styleConfig.text_color);
  const textAlign = getTextAlignClass(styleConfig.text_align);
  
  const copyCoupon = async () => {
    if (coupon?.code) {
      try {
        await navigator.clipboard.writeText(coupon.code);
        toast.success(`¡Código ${coupon.code} copiado al portapapeles!`);
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        toast.error('No se pudo copiar el código. Inténtalo manualmente.');
        console.error('Clipboard error:', err);
      }
    }
  };

  // Default CTA values
  const ctaButtonText = cta_text || 'Comprar Ahora';
  const ctaButtonLink = cta_link || '/productos';

  // Auto-detect compact mode for certain zones
  const isCompact = compact || zone === 'cart_sidebar' || zone === 'product_page';

  // Compact layout for cart_sidebar and product_page (optimized for mobile)
  if (isCompact) {
    return (
      <a 
        href={ctaButtonLink}
        className={`relative block w-full overflow-hidden rounded-lg group ${className}`}
      >
        {/* Background Image with picture element for responsive optimization */}
        <div className="absolute inset-0">
          <picture>
            <source 
              srcSet={mobile_image_url || displayImage} 
              media="(max-width: 640px)" 
              type="image/webp"
            />
            <img 
              src={displayImage} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </picture>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Compact Content with improved mobile touch targets */}
        <div className="relative z-10 flex items-center justify-between p-3 md:p-4 min-h-[44px]">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-sm md:text-base font-bold text-white truncate">
              {title}
            </h3>
            {coupon && (
              <span className="text-xs text-primary font-mono font-bold">
                Código: {coupon.code}
              </span>
            )}
          </div>
          <span className="flex-shrink-0 bg-primary text-primary-foreground px-3 py-2 md:py-1.5 rounded text-xs font-medium ml-2 min-h-[44px] md:min-h-0 flex items-center">
            {ctaButtonText}
          </span>
        </div>
      </a>
    );
  }

  // Full layout for home_hero and announcement_top with optimized images
  return (
    <div className={`relative w-full overflow-hidden group ${className}`}>
      {/* Background Image with responsive sources for better performance */}
      <div className="absolute inset-0">
        <picture>
          {/* Mobile image if available */}
          {mobile_image_url && (
            <source 
              srcSet={mobile_image_url} 
              media="(max-width: 768px)" 
            />
          )}
          {/* Desktop image */}
          <img 
            src={displayImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading={zone === 'home_hero' ? 'eager' : 'lazy'}
            fetchpriority={zone === 'home_hero' ? 'high' : 'auto'}
          />
        </picture>
        {/* Overlay gradient — driven by style_config */}
        <div className={`absolute inset-0 ${getOverlayClasses(styleConfig, 'banner-full')}`} />
      </div>

      {/* Content — overlay_position drives horizontal placement */}
      <div className={`relative z-10 container mx-auto px-4 py-12 md:py-20 flex flex-col ${getContentPositionClasses(styleConfig.overlay_position)}`}>
        <div className={`max-w-2xl flex flex-col ${textAlign}`}>
        <h2 className={`font-display text-3xl md:text-5xl font-bold mb-4 ${textColor} drop-shadow-sm`}>
          {title}
        </h2>
        
        {description && (
          <p className={`text-lg md:text-xl max-w-xl mb-6 ${textColor} opacity-90`}>
            {description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          {/* CTA Button */}
          <a 
            href={ctaButtonLink}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 transform duration-100"
          >
            {ctaButtonText}
          </a>

          {/* Coupon Display */}
          {coupon && (
            <>
              <div className="bg-white/90 backdrop-blur text-black px-4 py-2 rounded-lg font-mono font-bold border border-zinc-200 shadow-lg">
                {coupon.code}
              </div>
              <button 
                onClick={copyCoupon}
                className="text-sm underline opacity-80 hover:opacity-100 transition-opacity"
              >
                Copiar Código
              </button>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
