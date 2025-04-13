import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AWSCredentialsFormData } from '@/types/awsCredentialsForm';

const initialState: AWSCredentialsFormData = {
  accountId: '',
  keyId: '',
  secretKey: '',
};

export const formSlice = createSlice({
  name: 'awsCredentialsForm',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<AWSCredentialsFormData>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setFormData } = formSlice.actions;
export default formSlice.reducer;
