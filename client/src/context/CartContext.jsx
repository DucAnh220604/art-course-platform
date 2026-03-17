import { createContext, useContext, useState, useEffect, useCallback } from "react";
import cartApi from "@/api/cartApi";
import wishlistApi from "@/api/wishlistApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const res = await cartApi.getCart();
      setCartCount(res.data.data?.length || 0);
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    }
  }, [isAuthenticated]);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await wishlistApi.getWishlist();
      setWishlistCount(res.data.totalItems || 0);
    } catch (error) {
      console.error("Failed to refresh wishlist:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      refreshWishlist();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [isAuthenticated, user, refreshCart, refreshWishlist]);

  return (
    <CartContext.Provider value={{ cartCount, wishlistCount, refreshCart, refreshWishlist }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
