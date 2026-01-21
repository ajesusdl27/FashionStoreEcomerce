import { 
  Tag, 
  Shirt, 
  Footprints, 
  Watch, 
  User, 
  UserCheck, 
  Baby,
  Glasses,
  Crown,
  Heart,
  Star,
  Sparkles,
  Zap,
  Sun,
  Moon,
  Flower,
  Gift,
  ShoppingBag,
  type LucideIcon
} from 'lucide-react';

export interface CategoryIconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Mapeo de nombres de iconos a componentes de Lucide React
 */
const ICON_MAP: Record<string, LucideIcon> = {
  // Iconos básicos
  tag: Tag,
  shirt: Shirt,
  pants: Shirt, // Usamos shirt como fallback para pantalones
  footprints: Footprints,
  watch: Watch,
  
  // Usuarios
  user: User,
  'user-check': UserCheck,
  baby: Baby,
  
  // Accesorios
  glasses: Glasses,
  crown: Crown,
  
  // Emociones y destacados
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
  zap: Zap,
  
  // Tiempo/estación
  sun: Sun,
  moon: Moon,
  flower: Flower,
  
  // Comercio
  gift: Gift,
  'shopping-bag': ShoppingBag,
};

/**
 * Mapeo de tamaños a clases CSS
 */
const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
} as const;

/**
 * Componente para mostrar iconos de categorías dinámicamente
 */
export default function CategoryIcon({ 
  name, 
  size = 'md', 
  className = '' 
}: CategoryIconProps) {
  // Normalizar nombre del icono
  const normalizedName = name.toLowerCase().trim();
  
  // Obtener componente de icono
  const IconComponent = ICON_MAP[normalizedName] || Tag;
  
  // Construir clases CSS
  const sizeClass = SIZE_MAP[size];
  const finalClassName = `${sizeClass} ${className}`.trim();
  
  return <IconComponent className={finalClassName} />;
}

/**
 * Componente wrapper con animación para iconos destacados
 */
export function AnimatedCategoryIcon({ 
  name, 
  size = 'md', 
  className = '',
  animate = false 
}: CategoryIconProps & { animate?: boolean }) {
  const animationClass = animate 
    ? 'transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3' 
    : '';
  
  return (
    <CategoryIcon 
      name={name} 
      size={size} 
      className={`${className} ${animationClass}`.trim()} 
    />
  );
}

/**
 * Lista de iconos disponibles para selección en admin
 */
export const AVAILABLE_ICONS = [
  { value: 'tag', label: 'Etiqueta (por defecto)', component: Tag },
  { value: 'shirt', label: 'Camiseta', component: Shirt },
  { value: 'footprints', label: 'Calzado', component: Footprints },
  { value: 'watch', label: 'Accesorios', component: Watch },
  { value: 'user', label: 'Usuario', component: User },
  { value: 'user-check', label: 'Usuario verificado', component: UserCheck },
  { value: 'baby', label: 'Niños', component: Baby },
  { value: 'glasses', label: 'Gafas', component: Glasses },
  { value: 'crown', label: 'Premium', component: Crown },
  { value: 'heart', label: 'Favoritos', component: Heart },
  { value: 'star', label: 'Destacado', component: Star },
  { value: 'sparkles', label: 'Nuevo', component: Sparkles },
  { value: 'zap', label: 'Ofertas', component: Zap },
  { value: 'sun', label: 'Verano', component: Sun },
  { value: 'moon', label: 'Noche', component: Moon },
  { value: 'flower', label: 'Primavera', component: Flower },
  { value: 'gift', label: 'Regalos', component: Gift },
  { value: 'shopping-bag', label: 'Compras', component: ShoppingBag },
] as const;

/**
 * Utilidad para obtener sugerencias de iconos basadas en el nombre de la categoría
 */
export function suggestIconForCategory(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  // Mapeo inteligente basado en palabras clave
  if (name.includes('camiseta') || name.includes('shirt') || name.includes('blusa')) return 'shirt';
  if (name.includes('pantalon') || name.includes('jean') || name.includes('trouser')) return 'shirt';
  if (name.includes('zapato') || name.includes('shoe') || name.includes('calzado') || name.includes('sneaker')) return 'footprints';
  if (name.includes('accesorio') || name.includes('accessory') || name.includes('reloj') || name.includes('watch')) return 'watch';
  if (name.includes('gafa') || name.includes('glasses') || name.includes('lente')) return 'glasses';
  if (name.includes('mujer') || name.includes('woman') || name.includes('femenin')) return 'user';
  if (name.includes('hombre') || name.includes('man') || name.includes('masculin')) return 'user-check';
  if (name.includes('niño') || name.includes('kid') || name.includes('child') || name.includes('baby')) return 'baby';
  if (name.includes('premium') || name.includes('luxury') || name.includes('exclusiv')) return 'crown';
  if (name.includes('nuevo') || name.includes('new') || name.includes('novedad')) return 'sparkles';
  if (name.includes('oferta') || name.includes('sale') || name.includes('descuento')) return 'zap';
  if (name.includes('verano') || name.includes('summer') || name.includes('playa')) return 'sun';
  if (name.includes('invierno') || name.includes('winter') || name.includes('abrigo')) return 'moon';
  if (name.includes('regalo') || name.includes('gift')) return 'gift';
  
  // Fallback por defecto
  return 'tag';
}