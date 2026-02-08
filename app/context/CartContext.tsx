'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';

/* ---------------- TYPES ---------------- */
export interface CartItem {
  id: string; 
  lineId?: string; 
  title: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

export type ShippingMethod = 'standard' | 'express';

interface CartContextType {
  cartItems: CartItem[];
  cartId: string | null;
  isCartDrawerOpen: boolean; 
  setIsCartDrawerOpen: (open: boolean) => void;
  isPageLoading: boolean;
  setIsPageLoading: (loading: boolean) => void; 
  addToCart: (item: Omit<CartItem, 'quantity' | 'lineId'>, quantity: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  shippingMethod: ShippingMethod;
  setShippingMethod: (method: ShippingMethod) => void;
  shippingCost: number;
  finalTotal: number;
  subtotal: number;
  freeShippingThreshold: number;

  // --- NEW: Global Banner State (Fixes your Build Error) ---
  isBannerVisible: boolean;
  hideBanner: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const mapShopifyLineToCartItem = (edge: any): CartItem => {
  const node = edge.node;
  return {
    id: node.merchandise.id,
    lineId: node.id, 
    title: node.merchandise.product.title,
    variant: node.merchandise.title === 'Default Title' ? 'Default' : node.merchandise.title,
    price: parseFloat(node.merchandise.price.amount),
    quantity: node.quantity,
    image: node.merchandise.image?.url || ''
  };
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');

  // --- NEW: Banner State Implementation ---
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const hideBanner = () => setIsBannerVisible(false);

  // Load Shipping Rates
  const FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD) || 99;
  const SHIPPING_STANDARD_COST = Number(process.env.NEXT_PUBLIC_SHIPPING_STANDARD_COST) || 9;
  const SHIPPING_EXPRESS_COST = Number(process.env.NEXT_PUBLIC_SHIPPING_EXPRESS_COST) || 14.95;

  // --- CRITICAL HELPER: REFRESH STATE FROM SERVER RESPONSE ---
  const refreshCartState = (cart: any) => {
    if (!cart) return;

    // 1. Sync Items
    if (cart.lines?.edges) {
      setCartItems(cart.lines.edges.map(mapShopifyLineToCartItem));
    }

    // 2. Sync Coupon Code (Single Source of Truth)
    if (cart.discountCodes && cart.discountCodes.length > 0) {
      setAppliedCoupon(cart.discountCodes[0].code);
    } else {
      setAppliedCoupon(null);
    }

    // 3. Calculate "True" Subtotal (Sum of Item Prices)
    // ADDED SAFETY CHECK: Use ?. to prevent 'reduce of undefined' crash
    const trueSubtotal = cart.lines?.edges?.reduce((acc: number, edge: any) => {
        return acc + (parseFloat(edge.node.merchandise.price.amount) * edge.node.quantity);
    }, 0) || 0;

    let calculatedDiscount = 0;

    // 4. Calculate Discount using 'subtotalAmount' 
    if (cart.cost?.subtotalAmount?.amount) {
       const shopifyAfterDiscountSubtotal = parseFloat(cart.cost.subtotalAmount.amount);
       calculatedDiscount = trueSubtotal - shopifyAfterDiscountSubtotal;
    } else {
       calculatedDiscount = 0;
    }
    
    // 5. Update State
    if (calculatedDiscount > 0.01) {
       setDiscountAmount(calculatedDiscount);
    } else {
       setDiscountAmount(0);
    }
  };

  const forceClearState = () => {
    setCartItems([]);
    setCartId(null);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    localStorage.removeItem('shopify_cart_id');
    localStorage.removeItem('local_cart_items');
    localStorage.removeItem('raw_earth_coupon');
  };

  useEffect(() => {
    const initializeCart = async () => {
      setIsPageLoading(true);
      const savedCartId = localStorage.getItem('shopify_cart_id');
      
      if (savedCartId) {
        setCartId(savedCartId);
        try {
          const res = await fetch(`/api/shopify/cart?id=${savedCartId}`);
          if (res.ok) {
            const data = await res.json();
            if (!data) {
                forceClearState();
            } else {
                refreshCartState(data);
            }
          } else {
             console.warn("Cart ID invalid or expired. Resetting.");
             forceClearState();
          }
        } catch (e) {
          console.error("Cart Sync Failed", e);
        }
      } else {
        const savedItems = localStorage.getItem('local_cart_items');
        if (savedItems) setCartItems(JSON.parse(savedItems));
      }
      
      setIsPageLoading(false);
    };

    initializeCart();
  }, []);

  useEffect(() => {
    localStorage.setItem('local_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (item: Omit<CartItem, 'quantity' | 'lineId'>, quantity: number = 1) => {
    const previousCartItems = [...cartItems];

    setCartItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      if (existingItem) {
        return currentItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...currentItems, { ...item, quantity, lineId: undefined } as CartItem];
    });

    try {
      const response = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, variantId: item.id, quantity })
      });
      
      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      
      if (!cartId && data.id) {
        setCartId(data.id);
        localStorage.setItem('shopify_cart_id', data.id);
      }

      refreshCartState(data);

    } catch (error) {
      console.error("Shopify sync failed, rolling back:", error);
      setCartItems(previousCartItems);
      alert("Failed to add item to cart. Please check your connection.");
    }
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const previousCartItems = [...cartItems];
    const targetItem = cartItems.find(i => i.id === variantId);
    
    setCartItems(currentItems =>
      currentItems.map(item => item.id === variantId ? { ...item, quantity } : item)
    );

    if (cartId && targetItem?.lineId) {
      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'PUT',
          body: JSON.stringify({ cartId, lineId: targetItem.lineId, quantity })
        });
        
        if (!res.ok) throw new Error('Update failed');
        
        const data = await res.json();
        refreshCartState(data);
      } catch (err) {
        console.error("Update failed, rolling back", err);
        setCartItems(previousCartItems);
      }
    }
  };

  const removeFromCart = async (variantId: string) => {
    const previousCartItems = [...cartItems];
    const targetItem = cartItems.find(i => i.id === variantId);
    
    setCartItems(currentItems => currentItems.filter(item => item.id !== variantId));

    if (cartId && targetItem?.lineId) {
      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'DELETE',
          body: JSON.stringify({ cartId, lineIds: [targetItem.lineId] })
        });

        if (!res.ok) throw new Error('Delete failed');

        const data = await res.json();
        refreshCartState(data);
      } catch (err) {
        console.error("Remove failed, rolling back", err);
        setCartItems(previousCartItems);
      }
    }
  };

  const clearCart = () => {
    forceClearState();
  };

  const applyCoupon = async (code: string) => {
    if (!cartId) return { success: false, message: 'Cart not initialized' };
    
    try {
      const res = await fetch('/api/shopify/apply-discount', {
        method: 'POST',
        body: JSON.stringify({ checkoutId: cartId, discountCode: code })
      });
      const result = await res.json();

      if (result.success) {
        refreshCartState(result.cart || result); 
        setAppliedCoupon(code);
        return { success: true, message: 'Discount applied!' };
      }
      return { success: false, message: result.error || 'Invalid code' };
    } catch (err) {
      return { success: false, message: 'System error' };
    }
  };

  const removeCoupon = async () => {
    if (!cartId) return;

    // Optimistic Update
    setAppliedCoupon(null);
    setDiscountAmount(0);
    localStorage.removeItem('raw_earth_coupon');

    // Real Backend Removal
    try {
      const res = await fetch('/api/shopify/remove-discount', {
        method: 'POST',
        body: JSON.stringify({ cartId })
      });
      const data = await res.json();
      
      if (data.success && data.cart) {
        refreshCartState(data.cart);
      }
    } catch (err) {
      console.error("Failed to remove coupon from server", err);
    }
  };

  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  
  const shippingCost = useMemo(() => {
    if (cartItems.length === 0) return 0;
    if (shippingMethod === 'standard') {
      return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_STANDARD_COST;
    }
    return SHIPPING_EXPRESS_COST; 
  }, [shippingMethod, subtotal, FREE_SHIPPING_THRESHOLD, SHIPPING_STANDARD_COST, SHIPPING_EXPRESS_COST]);

  const finalTotal = (subtotal + shippingCost) - discountAmount;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartId,
        isCartDrawerOpen, 
        setIsCartDrawerOpen,
        isPageLoading,
        setIsPageLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        shippingMethod,
        setShippingMethod,
        shippingCost,
        subtotal,
        finalTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        // --- Export New Banner State ---
        isBannerVisible,
        hideBanner
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}