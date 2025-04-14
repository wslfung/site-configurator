import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemePreferenceFormData } from '@/types/themePreferenceForm';

const initialState: ThemePreferenceFormData = {
  theme: 'light',
};

export const themePreferenceFormSlice = createSlice({
  name: 'themePreferenceForm',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<ThemePreferenceFormData>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setFormData } = themePreferenceFormSlice.actions;
export default themePreferenceFormSlice.reducer;
