import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesData {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
}

interface SalesChartProps {
  data: SalesData[];
  /** Show a moving average trend line */
  showTrend?: boolean;
}

/**
 * Compute a simple moving average (window=3) for trend overlay
 */
function movingAverage(values: number[], window = 3): (number | null)[] {
  return values.map((_, i) => {
    if (i < window - 1) return null;
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) sum += values[j];
    return sum / window;
  });
}

/**
 * Sales Chart Component
 * Interactive bar chart showing daily sales with optional trend line overlay
 */
export default function SalesChart({ data, showTrend = true }: SalesChartProps) {
  // Handle empty or null data
  if (!data || data.length === 0) {
    return (
      <div className="h-64 sm:h-80 flex items-center justify-center text-muted-foreground">
        <p>No hay datos de ventas disponibles</p>
      </div>
    );
  }

  const revenues = data.map(d => d.revenue);
  const trendValues = showTrend ? movingAverage(revenues) : [];

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Ventas (€)',
        data: revenues,
        backgroundColor: 'rgba(204, 255, 0, 0.2)',
        borderColor: 'rgba(204, 255, 0, 1)',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40,
        order: 2,
      },
      ...(showTrend ? [{
        type: 'line' as const,
        label: 'Tendencia',
        data: trendValues,
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: true,
        spanGaps: true,
        order: 1,
      }] : []),
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context: any) {
            const revenue = context.parsed.y.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR'
            });
            const orders = data[context.dataIndex]?.orderCount || 0;
            return [
              `Ventas: ${revenue}`,
              `Pedidos: ${orders}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0
            });
          },
          color: 'rgba(161, 161, 170, 1)'
        },
        grid: {
          color: 'rgba(161, 161, 170, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgba(161, 161, 170, 1)'
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="h-64 sm:h-80">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
