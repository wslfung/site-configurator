import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AWSCredentials } from '@/types/awsCredentials';

const initialState: AWSCredentials = {
  accountId: '',
  keyId: '',
  secretKey: '',
};

export const formSlice = createSlice({
  name: 'awsCredentialsForm',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<AWSCredentials>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setFormData } = formSlice.actions;
export default formSlice.reducer;
