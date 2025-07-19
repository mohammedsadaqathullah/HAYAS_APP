import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from './baseUrl';

// Type representing a User object (matches your Mongoose schema)
export interface User {
  name: string;
  phone: string;
  email: string;
  password?: string;
  doorNoAndStreetName: string;
  area: string;
  place: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Response structure when getting user by email/phone
interface GetUserResponse {
  userObject: User;
}

// Response structure for actions like save, update, delete
interface GenericResponse {
  message: string;
  user?: User;
}

// Mutation args
interface SaveUserArg extends User {}
interface UpdateUserArg {
  email: string;
  data: Partial<User>;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/user`,
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // POST or UPSERT User
    saveUser: builder.mutation<GenericResponse, SaveUserArg>({
      query: (address) => ({
        url: '/',
        method: 'POST',
        body: address,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.email }],
    }),

    // GET User by Email
    getUserByEmail: builder.query<GetUserResponse, string>({
      query: (email) => `by-email/${email}`,
      providesTags: (result, error, email) => [{ type: 'User', id: email }],
    }),

    // GET User by Phone
    getUserByPhone: builder.query<GetUserResponse, string>({
      query: (phone) => `by-phone/${phone}`,
      providesTags: () => [{ type: 'User' }],
    }),

    // PUT User
    updateUser: builder.mutation<GenericResponse, UpdateUserArg>({
      query: ({ email, data }) => ({
        url: `/${email}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.email }],
    }),

    // DELETE User
    deleteUser: builder.mutation<GenericResponse, string>({
      query: (email) => ({
        url: `/${email}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, email) => [{ type: 'User', id: email }],
    }),

    // Logout User
    logoutUser: builder.mutation<GenericResponse, string>({
      query: (email) => ({
        url: '/logout',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const {
  useSaveUserMutation,
  useGetUserByEmailQuery,
  useGetUserByPhoneQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLogoutUserMutation,
} = userApi;
