import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
  total: 0,
  itemCount: 0,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        (item) => 
          item.product._id === action.payload.product._id &&
          item.size === action.payload.size &&
          item.color === action.payload.color &&
          item.fabric === action.payload.fabric
      );

      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product._id === action.payload.product._id &&
          item.size === action.payload.size &&
          item.color === action.payload.color &&
          item.fabric === action.payload.fabric
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: newItems,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      };
    }

    case 'CALCULATE_TOTALS': {
      const total = state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const itemCount = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        ...state,
        total,
        itemCount,
      };
    }

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Calculate totals whenever items change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTALS' });
  }, [state.items]);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  }, [state.items]);

  // Add item to cart
  const addToCart = (product, quantity = 1, size = '', color = '', fabric = '') => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to the cart');
      return;
    }
    const cartItem = {
      id: `${product._id}-${size}-${color}-${fabric}`,
      product,
      quantity,
      size,
      color,
      fabric,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    toast.success(`${product.name} added to cart!`);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    toast.success('Item removed from cart');
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: itemId, quantity },
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  // Get item quantity
  const getItemQuantity = (productId, size = '', color = '', fabric = '') => {
    const item = state.items.find(
      (item) =>
        item.product._id === productId &&
        item.size === size &&
        item.color === color &&
        item.fabric === fabric
    );
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId, size = '', color = '', fabric = '') => {
    return state.items.some(
      (item) =>
        item.product._id === productId &&
        item.size === size &&
        item.color === color &&
        item.fabric === fabric
    );
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 