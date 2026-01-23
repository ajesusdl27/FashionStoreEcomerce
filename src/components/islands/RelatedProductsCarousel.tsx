import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  offer_price?: number | null;
  is_offer?: boolean;
  category?: { name: string; slug: string } | null;
  images?: { image_url: string; order: number }[] | null;
  variants?: { id: string; size: string; stock: number }[] | null;
}

interface Props {
  products: Product[];
}

export default function RelatedProductsCarousel({ products }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
      
      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = direction === "left" ? -400 : 400;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const calculateDiscount = (original: number, offer: number) => {
    return Math.round(((original - offer) / original) * 100);
  };

  const getImageUrl = (product: Product) => {
    return (
      product.images?.[0]?.image_url ||
      "https://placehold.co/400x400/1a1a1a/ccff00?text=No+Image"
    );
  };

  const getTotalStock = (product: Product) => {
    return product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  };

  return (
    <div className="mt-16 border-t border-border pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl mb-1">
            También te puede interesar
          </h2>
          <p className="text-sm text-muted-foreground">
            Productos similares de la misma categoría
          </p>
        </div>

        {/* Navigation Buttons - Desktop only */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            aria-label="Scroll izquierda"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            aria-label="Scroll derecha"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => {
          const hasOffer = product.is_offer && product.offer_price;
          const displayPrice = hasOffer ? product.offer_price : product.price;
          const totalStock = getTotalStock(product);
          const isLowStock = totalStock > 0 && totalStock <= 5;
          const imageUrl = getImageUrl(product);

          // Get available sizes
          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
          const availableSizes = product.variants
            ?.filter(v => v.stock > 0)
            .map(v => v.size)
            .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)) || [];

          return (
            <a
              key={product.id}
              href={`/productos/${product.slug}`}
              className="group flex-shrink-0 w-[280px] snap-start"
            >
              {/* Product Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3 border border-border group-hover:border-primary/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Quick View Overlay (Desktop only) */}
                {totalStock > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex flex-col items-center justify-end pb-4">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                      Ver Producto
                    </span>
                    {availableSizes.length > 0 && (
                      <div className="flex gap-1 mt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        {availableSizes.slice(0, 5).map((size) => (
                          <span key={size} className="px-2 py-1 bg-white/90 text-black text-xs rounded font-medium">
                            {size}
                          </span>
                        ))}
                        {availableSizes.length > 5 && (
                          <span className="px-2 py-1 bg-white/90 text-black text-xs rounded font-medium">
                            +{availableSizes.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                  {hasOffer && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                      -
                      {calculateDiscount(
                        product.price,
                        product.offer_price!
                      )}
                      %
                    </span>
                  )}
                </div>

                {/* Low stock indicator */}
                {isLowStock && (
                  <div className="absolute bottom-2 left-2 right-2 z-10">
                    <span className="block w-full bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded text-center shadow-lg">
                      ⚡ Últimas {totalStock} unidades
                    </span>
                  </div>
                )}

                {/* Out of stock */}
                {totalStock === 0 && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <span className="bg-red-500 text-white font-bold px-4 py-2 rounded shadow-lg">
                      AGOTADO
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <h3 className="font-medium text-sm mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>

              <div className="flex items-center gap-2">
                <span
                  className={`font-bold text-lg ${
                    hasOffer ? "text-accent" : "text-foreground"
                  }`}
                >
                  {formatPrice(displayPrice!)}
                </span>

                {hasOffer && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>

      {/* Scroll Indicator - Mobile */}
      <div className="flex justify-center gap-1 mt-4 md:hidden">
        {products.map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
          />
        ))}
      </div>
    </div>
  );
}
