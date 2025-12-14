import { useMemo } from 'react';
import { useSitioData } from './useSitioData';

export function useProductData() {
  const {
    categorias,
    productos,
    addCategoria,
    addProduct,
    updateProduct,
    deleteProduct,
    setProducts,
    setCategorias
  } = useSitioData();

  return useMemo(() => ({
    categorias,
    productos,
    addCategoria,
    addProduct,
    updateProduct,
    deleteProduct,
    setProducts,
    setCategorias
  }), [categorias, productos, addCategoria, addProduct, updateProduct, deleteProduct, setProducts, setCategorias]);
}
