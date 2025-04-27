import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SESTemplateService } from '@/services/sesService';
import { SESTemplate } from '@/types/sesTemplate';
import { getAWSCredentials } from '@/utils/tools';

interface SESTemplateFormState {
  templates: string[];
  selectedTemplate: SESTemplate | null;
  selectedRegion: string; // NEW: track selected region
  loading: boolean;
  error: string | null;
}

const initialState: SESTemplateFormState = {
  templates: [],
  selectedTemplate: null,
  selectedRegion: 'none', // NEW: default value
  loading: false,
  error: null,
};

export const listTemplates = createAsyncThunk<
  string[],
  { region: string },
  { rejectValue: string }
>('sesTemplateForm/listTemplates', async ({ region }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) throw new Error('No credentials available');
    const service = new SESTemplateService(region, credentials);
    return await service.listTemplates();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error listing templates');
  }
});

export const getTemplate = createAsyncThunk<
  SESTemplate,
  { region: string; templateName: string },
  { rejectValue: string }
>('sesTemplateForm/getTemplate', async ({ region, templateName }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) throw new Error('No credentials available');
    const service = new SESTemplateService(region, credentials);
    return await service.getTemplate(templateName);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error getting template');
  }
});

export const createTemplate = createAsyncThunk<
  void,
  { region: string; template: SESTemplate },
  { rejectValue: string }
>('sesTemplateForm/createTemplate', async ({ region, template }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) throw new Error('No credentials available');
    const service = new SESTemplateService(region, credentials);
    await service.createTemplate(template);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error creating template');
  }
});

export const updateTemplate = createAsyncThunk<
  void,
  { region: string; template: SESTemplate },
  { rejectValue: string }
>('sesTemplateForm/updateTemplate', async ({ region, template }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) throw new Error('No credentials available');
    const service = new SESTemplateService(region, credentials);
    await service.updateTemplate(template);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error updating template');
  }
});

export const deleteTemplate = createAsyncThunk<
  void,
  { region: string; templateName: string },
  { rejectValue: string }
>('sesTemplateForm/deleteTemplate', async ({ region, templateName }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) throw new Error('No credentials available');
    const service = new SESTemplateService(region, credentials);
    await service.deleteTemplate(templateName);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error deleting template');
  }
});

export const sendTemplatedEmail = createAsyncThunk<
  void,
  { region: string; params: Parameters<SESTemplateService['sendTemplatedEmail']>[0] },
  { rejectValue: string }
>('sesTemplateForm/sendTemplatedEmail', async ({ region, params }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) throw new Error('No credentials available');
    const service = new SESTemplateService(region, credentials);
    await service.sendTemplatedEmail(params);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error sending templated email');
  }
});

const sesTemplateFormSlice = createSlice({
  name: 'sesTemplateForm',
  initialState,
  reducers: {
    setSelectedTemplate(state, action: PayloadAction<SESTemplate | null>) {
      state.selectedTemplate = action.payload;
    },
    setSelectedRegion(state, action: PayloadAction<string>) { // NEW
      state.selectedRegion = action.payload;
      state.selectedTemplate = null;
      state.templates = []; // Clear templates when region changes
    },
    resetAll(state) {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(listTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to list templates';
      })
      .addCase(getTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTemplate = action.payload;
      })
      .addCase(getTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get template';
      })
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create template';
      })
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update template';
      })
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete template';
      })
      .addCase(sendTemplatedEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendTemplatedEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendTemplatedEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send templated email';
      });
  },
});

export const {
  setSelectedTemplate,
  setSelectedRegion, // NEW
  resetAll
} = sesTemplateFormSlice.actions;

export default sesTemplateFormSlice.reducer;
