import { TrendingUp, TrendingDown, DollarSign, Clock, Star, ShoppingBag, Package, Users, Sparkles, RotateCcw, Ticket, Truck, Percent, BarChart3 } from "lucide-react";

type IconName = 'money' | 'clock' | 'star' | 'orders' | 'products' | 'users' | 'sparkles' | 'return' | 'coupon' | 'truck' | 'percent' | 'chart';

interface KPICardProps {
  title: string;
  value: string | number;
  iconName: IconName;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
  colorClass?: string;
  /** Data points for sparkline visualization (optional) */
  sparklineData?: number[];
  /** Link to drill-down page */
  href?: string;
  /** Whether this is an urgent/priority metric */
  urgent?: boolean;
}

const icons: Record<IconName, React.ReactNode> = {
  money: <DollarSign className="w-7 h-7" />,
  clock: <Clock className="w-7 h-7" />,
  star: <Star className="w-7 h-7" />,
  orders: <ShoppingBag className="w-7 h-7" />,
  products: <Package className="w-7 h-7" />,
  users: <Users className="w-7 h-7" />,
  sparkles: <Sparkles className="w-7 h-7" />,
  return: <RotateCcw className="w-7 h-7" />,
  coupon: <Ticket className="w-7 h-7" />,
  truck: <Truck className="w-7 h-7" />,
  percent: <Percent className="w-7 h-7" />,
  chart: <BarChart3 className="w-7 h-7" />,
};

/**
 * Simple Sparkline Component
 * Renders a mini line chart for trend visualization
 */
function Sparkline({ data, color = 'currentColor', height = 24 }: { data: number[]; color?: string; height?: number }) {
  if (!data || data.length < 2) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const width = 60;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg 
      width={width} 
      height={height} 
      className="opacity-60 group-hover:opacity-100 transition-opacity"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={parseFloat(points.split(' ').pop()?.split(',')[0] || '0')}
        cy={parseFloat(points.split(' ').pop()?.split(',')[1] || '0')}
        r="2"
        fill={color}
      />
    </svg>
  );
}

/**
 * KPI Card Component
 * Displays a key performance indicator with optional trend, sparkline, and icon
 */
export default function KPICard({ 
  title, 
  value, 
  iconName,
  trend, 
  trendLabel = 'vs mes anterior',
  subtitle,
  colorClass = 'text-primary',
  sparklineData,
  href,
  urgent = false,
}: KPICardProps) {
  const content = (
    <div className={`stat-card group ${href ? 'cursor-pointer' : ''} ${urgent ? 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background' : ''}`}>
      <div className="flex-1">
        <p className="stat-label flex items-center gap-2">
          {title}
          {urgent && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </p>
        <p className={`stat-value ${colorClass}`}>
          {value}
        </p>
        
        {/* Trend indicator */}
        {trend !== undefined && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${
            trend >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
          }`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend > 0 ? '+' : ''}{trend}% {trendLabel}
          </p>
        )}
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        
        {/* Sparkline */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="mt-2">
            <Sparkline 
              data={sparklineData} 
              color={trend !== undefined && trend >= 0 ? '#22c55e' : trend !== undefined ? '#ef4444' : 'currentColor'}
            />
          </div>
        )}
      </div>
      
      {/* Icon */}
      <div className={`stat-icon bg-current/10 group-hover:bg-current/20 transition-colors ${colorClass}`}>
        {icons[iconName]}
      </div>
      
      {/* Click indicator for linked cards */}
      {href && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
  
  if (href) {
    return (
      <a href={href} className="block relative">
        {content}
      </a>
    );
  }
  
  return <div className="relative">{content}</div>;
}

/**
 * KPI Card Skeleton for loading states
 */
export function KPICardSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex-1">
        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
        <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      </div>
      <div className="stat-icon bg-muted animate-pulse">
        <div className="w-7 h-7" />
      </div>
    </div>
  );
}
