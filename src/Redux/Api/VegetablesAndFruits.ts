// src/redux/services/vegetablesAndFruitsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from './baseUrl';

export interface VegetablesAndFruitsItem {
  _id: string;
  imageURL: string;
  title: string;
  description: string;
  quantityOne: string;
  quantityTwo: string;
  datePosted: string;
  __v: number;
}

export const vegetablesAndFruitsApi = createApi({
  reducerPath: 'vegetablesAndFruitsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
  }),
  endpoints: (builder) => ({
    getVegetablesAndFruits: builder.query<VegetablesAndFruitsItem[], void>({
      query: () => '/vegetables-and-fruits',
    }),
  }),
});

export const { useGetVegetablesAndFruitsQuery } = vegetablesAndFruitsApi;
