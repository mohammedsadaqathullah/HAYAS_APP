import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from './baseUrl';

interface SendOtpRequest {
  email: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface OtpResponse {
  success: boolean;
  message: string;
}

export const loginOtpApi = createApi({
  reducerPath: 'loginOtpApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    sendOtpLogin: builder.mutation<OtpResponse, SendOtpRequest>({
      query: ({ email }) => ({
        url: '/login/send-otp',
        method: 'POST',
        body: { email },
      }),
    }),
    verifyOtpLogin: builder.mutation<OtpResponse, VerifyOtpRequest>({
      query: ({ email, otp }) => ({
        url: '/login/verify-otp',
        method: 'POST',
        body: { email, otp },
      }),
    }),
  }),
});

export const { useSendOtpLoginMutation, useVerifyOtpLoginMutation } = loginOtpApi;
