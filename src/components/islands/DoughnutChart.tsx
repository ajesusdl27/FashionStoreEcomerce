import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
  title?: string;
  /** Height in pixels */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Format values as currency */
  isCurrency?: boolean;
}

const DEFAULT_COLORS = [
  'rgba(204, 255, 0, 0.8)',   // primary/yellow-green
  'rgba(59, 130, 246, 0.8)',   // blue
  'rgba(168, 85, 247, 0.8)',   // purple
  'rgba(249, 115, 22, 0.8)',   // orange
  'rgba(34, 197, 94, 0.8)',    // green
  'rgba(236, 72, 153, 0.8)',   // pink
  'rgba(161, 161, 170, 0.8)',  // zinc
  'rgba(20, 184, 166, 0.8)',   // teal
  'rgba(239, 68, 68, 0.8)',    // red
  'rgba(234, 179, 8, 0.8)',    // yellow
];

const DEFAULT_BORDER_COLORS = [
  'rgba(204, 255, 0, 1)',
  'rgba(59, 130, 246, 1)',
  'rgba(168, 85, 247, 1)',
  'rgba(249, 115, 22, 1)',
  'rgba(34, 197, 94, 1)',
  'rgba(236, 72, 153, 1)',
  'rgba(161, 161, 170, 1)',
  'rgba(20, 184, 166, 1)',
  'rgba(239, 68, 68, 1)',
  'rgba(234, 179, 8, 1)',
];

/**
 * Reusable Doughnut Chart Component
 * Used for order status distribution, revenue by category, etc.
 */
export default function DoughnutChart({
  labels,
  data,
  colors,
  height = 240,
  showLegend = true,
  isCurrency = false,
}: DoughnutChartProps) {
  if (!data || data.length === 0 || data.every(d => d === 0)) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm"
        style={{ height: `${height}px` }}
      >
        No hay datos disponibles
      </div>
    );
  }

  const bgColors = colors || DEFAULT_COLORS.slice(0, data.length);
  const borderColors = colors
    ? colors.map(c => c.replace(/[\d.]+\)$/, '1)'))
    : DEFAULT_BORDER_COLORS.slice(0, data.length);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
        labels: {
          color: 'rgba(161, 161, 170, 1)',
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            const formatted = isCurrency
              ? value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
              : value;
            return `${context.label}: ${formatted} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
