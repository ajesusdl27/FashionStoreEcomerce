import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  style_config: {
    text_color?: 'white' | 'black';
    text_align?: 'left' | 'center' | 'right';
  };
  coupons?: {
    code: string;
    discount_type: string;
    discount_value: number;
  };
}

interface PromotionBannerProps {
  zone: string;
  className?: string; // Additional classes
}

export default function PromotionBanner({ zone, className = '' }: PromotionBannerProps) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        // Fetch active promotions for this zone
        // We order by priority ascending (1 is top) and then created_at desc (newest first)
        const { data, error } = await supabase
          .from('promotions')
          .select('*, coupons(code, discount_type, discount_value)')
          .contains('locations', [zone])
          .eq('is_active', true)
          .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
          .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
          .order('priority', { ascending: true })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching promotion:', error);
        }

        if (data) {
          setPromotion(data);
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

  const { title, description, image_url, style_config, coupons } = promotion;
  const textColor = style_config?.text_color === 'black' ? 'text-black' : 'text-white';
  const textAlign = style_config?.text_align === 'center' 
    ? 'text-center items-center' 
    : style_config?.text_align === 'right' 
      ? 'text-right items-end' 
      : 'text-left items-start';
  
  const copyCoupon = () => {
    if (coupons?.code) {
      navigator.clipboard.writeText(coupons.code);
      toast.success(`Código ${coupons.code} copiado`, 'bottom-right');
    }
  };

  return (
    <div className={`relative w-full overflow-hidden group ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={image_url} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay gradient to improve readability based on text color */}
        <div className={`absolute inset-0 ${
          style_config?.text_color === 'black' 
            ? 'bg-gradient-to-r from-white/80 via-white/40 to-transparent' 
            : 'bg-black/30'
        }`} />
      </div>

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-4 py-12 md:py-20 flex flex-col ${textAlign}`}>
        <h2 className={`font-heading text-3xl md:text-5xl font-bold mb-4 ${textColor} drop-shadow-sm`}>
          {title}
        </h2>
        
        {description && (
          <p className={`text-lg md:text-xl max-w-xl mb-6 ${textColor} opacity-90`}>
            {description}
          </p>
        )}

        {coupons && (
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <div className="bg-white/90 backdrop-blur text-black px-4 py-2 rounded-lg font-mono font-bold border border-zinc-200 shadow-lg">
              {coupons.code}
            </div>
            <button 
              onClick={copyCoupon}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-medium transition-colors shadow-lg active:scale-95 transform duration-100"
            >
              Copiar Código
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
