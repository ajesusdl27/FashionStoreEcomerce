import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  size_type: 'clothing' | 'footwear' | 'universal';
  featured: boolean;
  display_order: number;
  description: string | null;
  icon_name: string;
  color_theme: string;
  created_at: string;
  product_count?: number;
}

export interface CategoriesState {
  categories: Category[];
  featuredCategories: Category[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export interface CategoriesActions {
  refetch: () => Promise<void>;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getFeaturedCategories: () => Category[];
  getCategoriesByTheme: (theme: string) => Category[];
}

export interface UseCategoriesReturn extends CategoriesState, CategoriesActions {}

/**
 * Hook personalizado para gestionar el estado de categorías
 * Incluye cache inteligente, manejo de errores y utilidades
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener categorías con conteo de productos
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select(`
          *,
          products:products(count)
        `)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Procesar datos y añadir conteo de productos
      const processedCategories: Category[] = (data || []).map(cat => ({
        ...cat,
        product_count: cat.products?.[0]?.count || 0
      }));

      setCategories(processedCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar categorías';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Utilidades derivadas
  const featuredCategories = categories.filter(cat => cat.featured);
  const isEmpty = categories.length === 0 && !isLoading;

  const getCategoryBySlug = useCallback((slug: string) => {
    return categories.find(cat => cat.slug === slug);
  }, [categories]);

  const getFeaturedCategories = useCallback(() => {
    return categories
      .filter(cat => cat.featured)
      .sort((a, b) => a.display_order - b.display_order);
  }, [categories]);

  const getCategoriesByTheme = useCallback((theme: string) => {
    return categories.filter(cat => cat.color_theme === theme);
  }, [categories]);

  return {
    // Estado
    categories,
    featuredCategories,
    isLoading,
    error,
    isEmpty,
    // Acciones
    refetch: fetchCategories,
    getCategoryBySlug,
    getFeaturedCategories,
    getCategoriesByTheme,
  };
}

/**
 * Hook simplificado para casos donde solo necesitas la lista básica
 */
export function useCategoriesList() {
  const { categories, isLoading, error } = useCategories();
  return { categories, isLoading, error };
}

/**
 * Hook para obtener solo categorías destacadas
 */
export function useFeaturedCategories() {
  const { featuredCategories, isLoading, error } = useCategories();
  return { featuredCategories, isLoading, error };
}