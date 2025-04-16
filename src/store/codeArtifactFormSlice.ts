import { CodeArtifactService, CodeArtifactPackage } from '@/services/codeArtifactService';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AWSCredentials } from '@/types/awsCredentials';
import { getAWSCredentials } from '@/utils/tools';

interface CodeArtifactFormState {
  region: string;
  domain: string;
  repository: string;
  packageName: string;
  version: string;
  targetRegion: string;
  domains: string[];
  repositories: string[];
  packages: CodeArtifactPackage[];
  versions: string[];
  loading: boolean;
  error: string | null;
}

const initialState: CodeArtifactFormState = {
  region: 'none',
  domain: 'none',
  repository: 'none',
  packageName: '',
  version: '',
  targetRegion: 'none',
  domains: [],
  repositories: [],
  packages: [],
  versions: [],
  loading: false,
  error: null,
};


// Thunks for async fetching
export const fetchDomains = createAsyncThunk<
  string[],
  { region: string },
  { rejectValue: string }
>('lambdaDeploy/fetchDomains', async ({ region }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) {
      return rejectWithValue('Failed to fetch domains: No credentials available');
    }
    const service = new CodeArtifactService(region, credentials);
    return await service.listDomains();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching domains');
  }
});

export const fetchRepositories = createAsyncThunk<
  string[],
  { region: string; domain: string },
  { rejectValue: string }
>('lambdaDeploy/fetchRepositories', async ({ region, domain }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) {
      return rejectWithValue('Failed to fetch repositories: No credentials available');
    }
    const service = new CodeArtifactService(region, credentials);
    return await service.listRepositories(domain);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching repositories');
  }
});

export const fetchPackages = createAsyncThunk<
  CodeArtifactPackage[],
  { region: string; domain: string; repository: string },
  { rejectValue: string }
>('lambdaDeploy/fetchPackages', async ({ region, domain, repository }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) {
      return rejectWithValue('Failed to fetch packages: No credentials available');
    }
    const service = new CodeArtifactService(region, credentials);
    return await service.listCodeArtifactPackages(domain, repository);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching packages');
  }
});

export const fetchVersions = createAsyncThunk<
  string[],
  { region: string; domain: string; repository: string; packageName: string; namespace: string; format: string },
  { rejectValue: string }
>('lambdaDeploy/fetchVersions', async ({ region, domain, repository, packageName, namespace, format }, { rejectWithValue }) => {
  try {
    const credentials = await getAWSCredentials();
    if (!credentials) {
      return rejectWithValue('Failed to fetch versions: No credentials available');
    }
    const service = new CodeArtifactService(region, credentials);
    // TypeScript: format should be PackageFormat, but string for thunk simplicity
    return await service.listCodeArtifactPackageVersions(domain, repository, packageName, namespace, format as any);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching versions');
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
      state.packageName = '';
      state.version = '';
      state.domains = [];
      state.repositories = [];
      state.packages = [];
      state.versions = [];
    },
    setDomain(state, action: PayloadAction<string>) {
      state.domain = action.payload;
      state.repository = 'none';
      state.packageName = '';
      state.version = '';
      state.repositories = [];
      state.packages = [];
      state.versions = [];
    },
    setRepository(state, action: PayloadAction<string>) {
      state.repository = action.payload;
      state.packageName = '';
      state.version = '';
      state.packages = [];
      state.versions = [];
    },
    setPackage(state, action: PayloadAction<string>) {
      state.packageName = action.payload;
      state.version = '';
      state.versions = [];
    },
    setVersion(state, action: PayloadAction<string>) {
      state.version = action.payload;
      state.targetRegion = 'none';
    },
    setTargetRegion(state, action: PayloadAction<string>) {
      state.targetRegion = action.payload;
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
      });
  },
});

export const {
  setRegion,
  setDomain,
  setRepository,
  setPackage,
  setVersion,
  resetAll
} = lambdaDeploySlice.actions;

export default lambdaDeploySlice.reducer;
