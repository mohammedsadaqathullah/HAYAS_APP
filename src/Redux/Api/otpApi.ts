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

export const otpApi = createApi({
  reducerPath: 'otpApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/otp`,
  }),
  endpoints: (builder) => ({
    sendOtp: builder.mutation<OtpResponse, SendOtpRequest>({
      query: ({ email }) => ({
        url: '/send-otp',
        method: 'POST',
        body: { email },
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    verifyOtp: builder.mutation<OtpResponse, VerifyOtpRequest>({
      query: ({ email, otp }) => ({
        url: '/verify-otp',
        method: 'POST',
        body: { email, otp },
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation } = otpApi;
