import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LambdaFormData } from '@/types/lambdaForm';

const initialState: LambdaFormData = {
  region: '',
  name: '',
  version: '',
  environment: '',
};

export const lambdaFormSlice = createSlice({
  name: 'lambdaForm',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<LambdaFormData>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setFormData } = lambdaFormSlice.actions;
export default lambdaFormSlice.reducer;
