import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from './baseUrl';

export interface Product {
  title: string;
  quantityType: string;
  quantityOne: string;
  quantityTwo?: string;
  count: number;
}

export interface Address {
  name: string;
  phone: string;
  street: string;
  area: string;
  defaultAddress: string;
}

export interface Order {
  _id?: string;
  products: Product[];
  address: Address;
  userEmail: string;
  createdAt?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED' | 'TIMEOUT';
  statusHistory?: {
    email: string;
    status: string;
    updatedAt: string;
  }[];
}

export interface PlaceOrderResponse {
  message: string;
  order: Order;
}

export interface OrdersByEmailResponse extends Array<Order> {}

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    // POST: Place a new order
    placeOrder: builder.mutation<PlaceOrderResponse, Omit<Order, '_id' | 'createdAt' | 'statusHistory'>>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // GET: Get all orders by user email
    getOrdersByEmail: builder.query<OrdersByEmailResponse, string>({
      query: (email) => `/orders/${email}`,
      providesTags: ['Order'],
    }),
  }),
});

export const { usePlaceOrderMutation, useGetOrdersByEmailQuery } = orderApi;
