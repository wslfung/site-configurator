import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CodeArtifactService, CodeArtifactPackage } from '@/services/codeArtifactService';
import { AWSCredentials } from '@/types/awsCredentials';
import { LambdaService } from '@/services/lambdaService';
import { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { EventBridgeService } from '@/services/eventBridgeService';

interface LambdaDeployState {
  region: string;
  domain: string;
  repository: string;
  package: string;
  version: string;
  targetRegion: string;
  domains: string[];
  repositories: string[];
  packages: CodeArtifactPackage[];
  versions: string[];
  deployResult: boolean;
  lambdaFunctionName: string;
  lambdaFunctions: FunctionConfiguration[];

  loading: boolean;
  error: string | null;
  credentials: AWSCredentials | null;
}

const initialState: LambdaDeployState = {
  region: 'none',
  domain: 'none',
  repository: 'none',
  package: '',
  version: '',
  targetRegion: 'none',
  domains: [],
  repositories: [],
  packages: [],
  versions: [],
  deployResult: false,
  lambdaFunctionName: '',
  lambdaFunctions: [],
  loading: false,
  error: null,
  credentials: null,
};

// Thunks for async fetching
export const fetchDomains = createAsyncThunk<
  string[],
  { region: string; credentials: AWSCredentials },
  { rejectValue: string }
>('lambdaDeploy/fetchDomains', async ({ region, credentials }, { rejectWithValue }) => {
  try {
    const service = new CodeArtifactService(region, credentials);
    return await service.listDomains();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching domains');
  }
});

export const fetchRepositories = createAsyncThunk<
  string[],
  { region: string; credentials: AWSCredentials; domain: string },
  { rejectValue: string }
>('lambdaDeploy/fetchRepositories', async ({ region, credentials, domain }, { rejectWithValue }) => {
  try {
    const service = new CodeArtifactService(region, credentials);
    return await service.listRepositories(domain);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching repositories');
  }
});

export const fetchPackages = createAsyncThunk<
  CodeArtifactPackage[],
  { region: string; credentials: AWSCredentials; domain: string; repository: string },
  { rejectValue: string }
>('lambdaDeploy/fetchPackages', async ({ region, credentials, domain, repository }, { rejectWithValue }) => {
  try {
    const service = new CodeArtifactService(region, credentials);
    return await service.listCodeArtifactPackages(domain, repository);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching packages');
  }
});

export const fetchVersions = createAsyncThunk<
  string[],
  { region: string; credentials: AWSCredentials; domain: string; repository: string; packageName: string; namespace: string; format: string },
  { rejectValue: string }
>('lambdaDeploy/fetchVersions', async ({ region, credentials, domain, repository, packageName, namespace, format }, { rejectWithValue }) => {
  try {
    const service = new CodeArtifactService(region, credentials);
    // TypeScript: format should be PackageFormat, but string for thunk simplicity
    return await service.listCodeArtifactPackageVersions(domain, repository, packageName, namespace, format as any);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching versions');
  }
});

export const fetchLambdaFunctions = createAsyncThunk<
  FunctionConfiguration[],
  { region: string; credentials: AWSCredentials },
  { rejectValue: string }
>('lambdaDeploy/fetchLambdaFunctions', async ({ region, credentials }, { rejectWithValue }) => {
  try {
    const service = new LambdaService(region, credentials);
    return await service.listLambdaFunctions();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching lambda functions');
  }
});

export const deployLambda = createAsyncThunk<
  boolean,
  { region: string; credentials: AWSCredentials; domain: string; repository: string; packageName: string; namespace: string; format: string; version: string; targetRegion: string; lambdaFunctionName: string },
  { rejectValue: string }
>('lambdaDeploy/deployLambda', async ({ region, credentials, domain, repository, packageName, namespace, format, version, targetRegion, lambdaFunctionName }, { rejectWithValue }) => {
  try {
    const service = new EventBridgeService('us-west-2', credentials);
    await service.putEventToEventBridge('default', 'wilsonfung', 'LambdaDeploy From CodeArtifact', {region, domain, repository, packageName, namespace, format, version, targetRegion, lambdaFunctionName});
    return true;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error deploying lambda');
  }
});

const lambdaDeploySlice = createSlice({
  name: 'lambdaDeploy',
  initialState,
  reducers: {
    setRegion(state, action: PayloadAction<string>) {
      state.region = action.payload;
      state.domain = 'none';
      state.repository = 'none';
      state.package = '';
      state.version = '';
      state.domains = [];
      state.repositories = [];
      state.packages = [];
      state.versions = [];
      state.lambdaFunctionName = '';
      state.lambdaFunctions = [];
    },
    setDomain(state, action: PayloadAction<string>) {
      state.domain = action.payload;
      state.repository = 'none';
      state.package = '';
      state.version = '';
      state.repositories = [];
      state.packages = [];
      state.versions = [];
      state.lambdaFunctionName = '';
      state.lambdaFunctions = [];
    },
    setRepository(state, action: PayloadAction<string>) {
      state.repository = action.payload;
      state.package = '';
      state.version = '';
      state.packages = [];
      state.versions = [];
      state.lambdaFunctionName = '';
      state.lambdaFunctions = [];
    },
    setPackage(state, action: PayloadAction<string>) {
      state.package = action.payload;
      state.version = '';
      state.versions = [];
      state.lambdaFunctionName = '';
      state.lambdaFunctions = [];
    },
    setVersion(state, action: PayloadAction<string>) {
      state.version = action.payload;
      state.targetRegion = 'none';
      state.lambdaFunctionName = '';
      state.lambdaFunctions = [];
    },
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
      .addCase(fetchDomains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.loading = false;
        state.domains = action.payload;
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch domains';
      })
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch repositories';
      })
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch packages';
      })
      .addCase(fetchVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.loading = false;
        state.versions = action.payload;
      })
      .addCase(fetchVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch versions';
      })
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
  setRegion,
  setDomain,
  setRepository,
  setPackage,
  setVersion,
  setTargetRegion,
  setCredentials,
  setLambdaFunctionName,
  resetAll
} = lambdaDeploySlice.actions;

export default lambdaDeploySlice.reducer;
