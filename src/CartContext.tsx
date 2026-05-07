import { createContext, useContext, useState, ReactNode } from 'react';

// Definimos la estructura del producto
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
}

// Definimos qué funciones y datos tendrá el carrito
interface CartContextType {
  cart: Producto[];
  addToCart: (product: Producto) => void;
  removeFromCart: (id: number) => void;
  total: number;
}

// Creamos el contexto con un valor inicial vacío
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Producto[]>([]);

  const addToCart = (product: Producto) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.precio, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};