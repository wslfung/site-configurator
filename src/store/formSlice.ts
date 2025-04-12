import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormData } from '@/types/form';

const initialState: FormData = {
  region: '',
  name: '',
  version: '',
  environment: '',
};

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<FormData>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setFormData } = formSlice.actions;
export default formSlice.reducer;
