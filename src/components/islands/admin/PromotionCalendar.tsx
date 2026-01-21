import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Plus } from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  locations: string[];
  image_url?: string;
}

interface PromotionCalendarProps {
  promotions: Promotion[];
}

// Get days in month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert to Monday-first (0 = Monday, 6 = Sunday)
  return day === 0 ? 6 : day - 1;
}

// Format date for comparison
function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function PromotionCalendar({ promotions }: PromotionCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Previous month days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days to fill the grid
    const remaining = 42 - days.length; // 6 rows * 7 days
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(nextYear, nextMonth, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentYear, currentMonth]);

  // Map promotions to dates
  const promotionsByDate = useMemo(() => {
    const map: Record<string, Promotion[]> = {};
    
    promotions.forEach(promo => {
      const startDate = new Date(promo.start_date);
      const endDate = promo.end_date ? new Date(promo.end_date) : null;
      
      // Add to each day the promotion spans
      const current = new Date(startDate);
      const end = endDate || new Date(currentYear, currentMonth + 1, 0); // End of month if no end date
      
      while (current <= end) {
        const key = formatDateKey(current);
        if (!map[key]) map[key] = [];
        map[key].push(promo);
        current.setDate(current.getDate() + 1);
        
        // Safety limit
        if (Object.keys(map).length > 365) break;
      }
    });
    
    return map;
  }, [promotions, currentYear, currentMonth]);

  const navigateMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const isToday = (date: Date): boolean => {
    return formatDateKey(date) === formatDateKey(today);
  };

  const getStatusColor = (promo: Promotion): string => {
    if (!promo.is_active) return 'bg-gray-500';
    
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = promo.end_date ? new Date(promo.end_date) : null;
    
    if (start > now) return 'bg-blue-500'; // Scheduled
    if (end && end < now) return 'bg-red-500'; // Expired
    return 'bg-green-500'; // Active
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-heading">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToToday}
            className="text-xs px-3 py-1 rounded border border-border hover:bg-muted transition-colors"
          >
            Hoy
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-muted-foreground">Activa</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-muted-foreground">Programada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-muted-foreground">Expirada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-500"></span>
          <span className="text-muted-foreground">Inactiva</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted">
          {DAY_NAMES.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const dateKey = formatDateKey(date);
            const dayPromotions = promotionsByDate[dateKey] || [];
            const isCurrentDay = isToday(date);
            const isHovered = hoveredDay === dateKey;
            
            return (
              <div
                key={idx}
                className={`min-h-[100px] border-t border-l border-border p-2 transition-colors ${
                  !isCurrentMonth ? 'bg-muted/50' : ''
                } ${isHovered ? 'bg-primary/5' : ''}`}
                onMouseEnter={() => setHoveredDay(dateKey)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Day Number */}
                <div className={`text-sm mb-1 ${
                  !isCurrentMonth ? 'text-muted-foreground' :
                  isCurrentDay ? 'w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold' :
                  'text-foreground'
                }`}>
                  {date.getDate()}
                </div>

                {/* Promotions */}
                <div className="space-y-1">
                  {dayPromotions.slice(0, 3).map(promo => (
                    <button
                      key={promo.id}
                      onClick={() => setSelectedPromotion(promo)}
                      className={`w-full text-left px-2 py-1 rounded text-xs text-white truncate transition-transform hover:scale-105 ${getStatusColor(promo)}`}
                      title={promo.title}
                    >
                      {promo.title}
                    </button>
                  ))}
                  {dayPromotions.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayPromotions.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promotion Detail Modal */}
      {selectedPromotion && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPromotion(null)}
        >
          <div 
            className="bg-card border border-border rounded-xl max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            {selectedPromotion.image_url && (
              <img 
                src={selectedPromotion.image_url} 
                alt={selectedPromotion.title}
                className="w-full h-40 object-cover"
              />
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium">{selectedPromotion.title}</h3>
                <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(selectedPromotion)}`}>
                  {!selectedPromotion.is_active ? 'Inactiva' :
                   new Date(selectedPromotion.start_date) > new Date() ? 'Programada' :
                   selectedPromotion.end_date && new Date(selectedPromotion.end_date) < new Date() ? 'Expirada' :
                   'Activa'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(selectedPromotion.start_date).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                    {selectedPromotion.end_date && (
                      <> → {new Date(selectedPromotion.end_date).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}</>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedPromotion.locations.join(', ')}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedPromotion(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cerrar
                </button>
                <a
                  href={`/admin/promociones/editar/${selectedPromotion.id}`}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                  Editar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {promotions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">No hay promociones programadas</p>
          <a
            href="/admin/promociones/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva Promoción
          </a>
        </div>
      )}
    </div>
  );
}
