import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from './baseUrl';

export interface ToyboxzItem {
  _id: string;
  imageURL: string;
  title: string;
  description: string;
  quantityOne: string;
  quantityTwo: string;
  datePosted: string;
  __v: number;
}

export const toyboxzApi = createApi({
  reducerPath: 'toyboxzApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
  }),
  endpoints: (builder) => ({
    getToyboxz: builder.query<ToyboxzItem[], void>({
      query: () => '/toyboxz',
    }),
  }),
});

export const { useGetToyboxzQuery } = toyboxzApi;
