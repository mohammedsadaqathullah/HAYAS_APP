// src/store.js
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { foodApi } from './Api/foodApi'
import cartReducer from './slice/cartSlice'
import userReducer from './slice/userSlice'
import { toyboxzApi } from './Api/toyboxzApi'
import { groceryApi } from './Api/groceryApi'
import { userApi } from './Api/userApi'
import { loginOtpApi } from './Api/LoginOtp'
import { otpApi } from './Api/otpApi'
import { orderApi } from './Api/orderApi'
import { vegetablesAndFruitsApi } from './Api/VegetablesAndFruits'

export const store = configureStore({
  reducer: {
    [foodApi.reducerPath]: foodApi.reducer,
    [groceryApi.reducerPath]: groceryApi.reducer, 
    [vegetablesAndFruitsApi.reducerPath]:vegetablesAndFruitsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [toyboxzApi.reducerPath]: toyboxzApi.reducer,
    [loginOtpApi.reducerPath]: loginOtpApi.reducer,
    [otpApi.reducerPath]: otpApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    cart: cartReducer,
    user:userReducer,
    },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      foodApi.middleware,
      groceryApi.middleware,
      vegetablesAndFruitsApi.middleware,
      userApi.middleware,
      toyboxzApi.middleware,
      loginOtpApi.middleware,
      otpApi.middleware,
      orderApi.middleware
    ),
})

setupListeners(store.dispatch)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;