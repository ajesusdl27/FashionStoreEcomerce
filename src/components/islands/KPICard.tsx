import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  colorClass?: string;
}

/**
 * KPI Card Component
 * Displays a key performance indicator with optional trend and icon
 */
export default function KPICard({ 
  title, 
  value, 
  icon, 
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
      <div className="stat-icon bg-current/10 group-hover:bg-current/20 transition-colors">
        {icon}
      </div>
    </div>
  );
}
