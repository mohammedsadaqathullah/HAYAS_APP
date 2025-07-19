import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------------
// Types
// ------------------------

export interface Product {
  _id: string;
  name: string;
  quantityOne: number;
  quantityTwo: number;
  [key: string]: any; // Add any other fields as needed
}

export interface CartItem extends Product {
  quantityType: 'One' | 'Two';
  quantity: number;
  count: number;
}

interface CartState {
  cart: CartItem[];
}

interface UpdateQuantityPayload {
  product: Product;
  quantityType: 'One' | 'Two';
  actionType: 'increase' | 'decrease';
}

interface ClearCartOnOrderProcessedPayload {
  orderStatus: string;
  orderId: string;
}

// ------------------------
// Local Storage Utilities
// ------------------------

const loadFromAsyncStorage = (): CartItem[] => {
  try {
    const serializedCart = AsyncStorage.getItem('cart');
    return serializedCart ? JSON.parse(serializedCart) : [];
  } catch (e) {
    console.error('Failed to load cart from AsyncStorage:', e);
    return [];
  }
};

const saveToAsyncStorage = (cart: CartItem[]) => {
  try {
    AsyncStorage.setItem('cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart to AsyncStorage:', e);
  }
};

// ------------------------
// Initial State
// ------------------------

const initialState: CartState = {
  cart: loadFromAsyncStorage(),
};

// ------------------------
// Slice
// ------------------------

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadCart(state, action: PayloadAction<CartItem[] | undefined>) {
      state.cart = action.payload || loadFromAsyncStorage();
    },
    updateQuantity(state, action: PayloadAction<UpdateQuantityPayload>) {
      const { product, quantityType, actionType } = action.payload;
      const quantity = quantityType === 'One' ? product.quantityOne : product.quantityTwo;

      const productIndex = state.cart.findIndex(
        (item) => item._id === product._id && item.quantityType === quantityType
      );

      if (productIndex !== -1) {
        const productInCart = state.cart[productIndex];
        const newCount =
          actionType === 'increase' ? productInCart.count + 1 : Math.max(productInCart.count - 1, 0);

        if (newCount === 0) {
          state.cart = state.cart.filter(
            (item) => item._id !== product._id || item.quantityType !== quantityType
          );
        } else {
          state.cart[productIndex].count = newCount;
        }
      } else if (actionType === 'increase') {
        state.cart.push({ ...product, quantityType, quantity, count: 1 });
      }

      saveToAsyncStorage(state.cart);
    },
    clearCart(state) {
      state.cart = [];
      saveToAsyncStorage(state.cart);
      console.log('Cart cleared successfully');
    },
    clearCartOnOrderProcessed(state, action: PayloadAction<ClearCartOnOrderProcessedPayload>) {
      const { orderStatus, orderId } = action.payload;
      console.log(`Clearing cart due to order ${orderId} status: ${orderStatus}`);
      state.cart = [];
      saveToAsyncStorage(state.cart);
    },
  },
});

export const { loadCart, updateQuantity, clearCart, clearCartOnOrderProcessed } = cartSlice.actions;
export default cartSlice.reducer;
