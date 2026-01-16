import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  iconName: 'money' | 'clock' | 'star';
  trend?: number;
  subtitle?: string;
  colorClass?: string;
}

const icons = {
  money: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  star: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

/**
 * KPI Card Component
 * Displays a key performance indicator with optional trend and icon
 */
export default function KPICard({ 
  title, 
  value, 
  iconName,
  trend, 
  subtitle,
  colorClass = 'text-primary'
}: KPICardProps) {
  return (
    <div className="stat-card group">
      <div>
        <p className="stat-label">{title}</p>
        <p className={`stat-value ${colorClass}`}>
          {value}
        </p>
        {trend !== undefined && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${
            trend >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend >= 0 ? '▲' : '▼'}
            {Math.abs(trend)}% vs mes anterior
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`stat-icon bg-current/10 group-hover:bg-current/20 transition-colors ${colorClass}`}>
        {icons[iconName]}
      </div>
    </div>
  );
}
