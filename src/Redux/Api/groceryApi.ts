import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from './baseUrl';

export interface GroceryItem {
  _id: string;
  imageURL: string;
  title: string;
  description: string;
  quantityOne: string;
  quantityTwo: string;
  datePosted: string;
  __v: number;
}

export const groceryApi = createApi({
  reducerPath: 'groceryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
  }),
  endpoints: (builder) => ({
    getGrocery: builder.query<GroceryItem[], void>({
      query: () => '/grocery',
    }),
  }),
});

export const { useGetGroceryQuery } = groceryApi;
