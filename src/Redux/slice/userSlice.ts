import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  doorNoAndStreetName?: string;
  area?: string;
  place?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

const initialState: UserState = {
  name: '',
  phone: '',
  email: '',
  doorNoAndStreetName: '',
  area: '',
  place: '',
  createdAt: '',
  updatedAt: '',
  __v: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserState>) => {
      return { ...action.payload };
    },
    clearUserData: () => {
      return { ...initialState };
    },
    updateUserField: (
      state,
      action: PayloadAction<{ key: keyof UserState; value: string | number }>
    ) => {
      const { key, value } = action.payload;
      state[key] = value as never;
    },
  },
});

export const { setUserData, clearUserData, updateUserField } = userSlice.actions;
export default userSlice.reducer;
