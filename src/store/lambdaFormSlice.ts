import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CodeArtifactService, CodeArtifactPackage } from '@/services/codeArtifactService';
import { AWSCredentials } from '@/types/awsCredentials';
import { LambdaService } from '@/services/lambdaService';
import { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { EventBridgeService } from '@/services/eventBridgeService';
import { getAWSCredentials } from '@/utils/tools';

interface LambdaFormState {
  targetRegion: string;
  deployResult: boolean;
  lambdaFunctionName: string;
  lambdaFunctions: FunctionConfiguration[];
  loading: boolean;
  error: string | null;
  credentials: AWSCredentials | null;
}

const initialState: LambdaFormState = {
  targetRegion: 'none',
  deployResult: false,
  lambdaFunctionName: '',
  lambdaFunctions: [],
  loading: false,
  error: null,
  credentials: null,
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

export const deployLambda = createAsyncThunk<
  boolean,
  { region: string; domain: string; repository: string; packageName: string; namespace: string; format: string; version: string; targetRegion: string; lambdaFunctionName: string },
  { rejectValue: string }
>('lambdaForm/deployLambda', async ({ region, domain, repository, packageName, namespace, format, version, targetRegion, lambdaFunctionName }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) {
      throw new Error('No credentials available');
    }
    const service = new EventBridgeService('us-west-2', credentials);
    await service.putEventToEventBridge('default', 'wilsonfung', 'LambdaDeploy From CodeArtifact', {region, domain, repository, packageName, namespace, format, version, targetRegion, lambdaFunctionName});
    return true;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error deploying lambda');
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
    setCredentials(state, action: PayloadAction<AWSCredentials | null>) {
      state.credentials = action.payload;
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
      .addCase(deployLambda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deployLambda.fulfilled, (state, action) => {
        state.loading = false;
        state.deployResult = action.payload;
      })
      .addCase(deployLambda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to deploy lambda';
      });
  },
});

export const {
  setTargetRegion,
  setCredentials,
  setLambdaFunctionName,
  resetAll
} = lambdaFormSlice.actions;

export default lambdaFormSlice.reducer;
