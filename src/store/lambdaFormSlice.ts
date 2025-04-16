import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CodeArtifactService, CodeArtifactPackage } from '@/services/codeArtifactService';
import { AWSCredentials } from '@/types/awsCredentials';
import { LambdaService } from '@/services/lambdaService';
import { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { getAWSCredentials } from '@/utils/tools';

interface LambdaFormState {
  targetRegion: string;
  lambdaFunctionName: string;
  lambdaFunctions: FunctionConfiguration[];
  loading: boolean;
  error: string | null;
}

const initialState: LambdaFormState = {
  targetRegion: 'none',
  lambdaFunctionName: '',
  lambdaFunctions: [],
  loading: false,
  error: null,
};

// Thunks for async fetching
export const fetchLambdaFunctions = createAsyncThunk<
  FunctionConfiguration[],
  { region: string;  },
  { rejectValue: string }
>('lambdaForm/fetchLambdaFunctions', async ({ region }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) {
      throw new Error('No credentials available');
    }
    const service = new LambdaService(region, credentials)
    return await service.listLambdaFunctions();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching lambda functions');
  }
});



const lambdaFormSlice = createSlice({
  name: 'lambdaForm',
  initialState,
  reducers: {
    setTargetRegion(state, action: PayloadAction<string>) {
      state.targetRegion = action.payload;
      state.lambdaFunctionName = '';
      state.lambdaFunctions = [];
    },
    setLambdaFunctionName(state, action: PayloadAction<string>) {
      state.lambdaFunctionName = action.payload;
    },
    resetAll(state) {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLambdaFunctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLambdaFunctions.fulfilled, (state, action) => {
        state.loading = false;
        state.lambdaFunctions = action.payload;
      })
      .addCase(fetchLambdaFunctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch lambda functions';
      })
  },
});

export const {
  setTargetRegion,
  setLambdaFunctionName,
  resetAll
} = lambdaFormSlice.actions;

export default lambdaFormSlice.reducer;
