import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from './baseUrl';

export interface FoodItem {
  _id: string;
  imageURL: string;
  title: string;
  description: string;
  quantityOne: string;
  quantityTwo: string;
  datePosted: string;
  __v: number;
}

export const foodApi = createApi({
  reducerPath: 'foodApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
  }),
  endpoints: (builder) => ({
    getFood: builder.query<FoodItem[], void>({
      query: () => '/food',
    }),
  }),
});

export const { useGetFoodQuery } = foodApi;
