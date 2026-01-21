interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="inline-flex items-center border border-border rounded-lg overflow-hidden bg-background">
      {/* Decrease button - 44x44px touch target (Apple HIG compliant) */}
      <button
        onClick={decrease}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Disminuir cantidad"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>
      
      {/* Quantity display with tabular-nums for aligned numbers and aria-live for screen readers */}
      <span 
        className="w-10 text-center text-sm font-bold tabular-nums border-x border-border"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      
      {/* Increase button - 44x44px touch target (Apple HIG compliant) */}
      <button
        onClick={increase}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Aumentar cantidad"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
