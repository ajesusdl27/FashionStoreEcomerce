import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface DashboardRefreshButtonProps {
  /** Server render timestamp (ISO string) */
  renderTime: string;
}

/**
 * Shows when the dashboard data was last loaded and provides manual refresh.
 * Client-side timer updates the "time ago" display every minute.
 */
export default function DashboardRefreshButton({ renderTime }: DashboardRefreshButtonProps) {
  const [timeAgo, setTimeAgo] = useState('ahora');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const rendered = new Date(renderTime).getTime();

    const update = () => {
      const diff = Math.floor((Date.now() - rendered) / 1000);
      if (diff < 60) {
        setTimeAgo('ahora');
      } else if (diff < 3600) {
        const mins = Math.floor(diff / 60);
        setTimeAgo(`hace ${mins} min`);
      } else {
        const hrs = Math.floor(diff / 3600);
        setTimeAgo(`hace ${hrs}h`);
      }
    };

    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [renderTime]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="hidden sm:inline">Actualizado {timeAgo}</span>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        title="Actualizar datos"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
