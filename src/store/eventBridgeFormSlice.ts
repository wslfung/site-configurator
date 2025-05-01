import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EventBridgeService } from '@/services/eventBridgeService';
import { getAWSCredentials } from '@/utils/tools';


interface EventBridgeFormState {
  ebBus: string;
  ebSource: string;
  detailType: string;
  deployResult: boolean;
  eventBuses: string[];
  loading: boolean;
  error: string | null;
}

const initialState: EventBridgeFormState = {
    ebBus: '',
    ebSource: '',
    detailType: '',
    deployResult: false,
    eventBuses: [],
    loading: false,
    error: null,
  };

export const listEventBuses = createAsyncThunk<
    string[],
    { region: string },
    { rejectValue: string }
  >('eventBridgeForm/listEventBuses', async ({ region }, { rejectWithValue }) => {
    try {
      const credentials = await getAWSCredentials();
      if (!credentials) {
        return rejectWithValue('Failed to fetch event buses: No credentials available');
      }
      const service = new EventBridgeService(region, credentials);
      return await service.listEventBuses();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error fetching event buses');
    }
  });

export const requestDeployment = createAsyncThunk<
    boolean,
    { region: string; domain: string; repository: string; packageName: string; namespace: string; format: string; version: string; lambdaRegion: string; lambdaFunctionName: string; ebBus: string; ebSource: string, detailType: string },
    { rejectValue: string }
  >('eventBridgeForm/requestDeployment', async ({ region, domain, repository, packageName, namespace, format, version, lambdaRegion, lambdaFunctionName, ebBus, ebSource, detailType }, { rejectWithValue }) => {
    try {
      const credentials = await getAWSCredentials();
      if (!credentials) {
        throw new Error('No credentials available');
      }
      const service = new EventBridgeService(region, credentials);
      await service.putEventToEventBridge(ebBus, ebSource, detailType, {
                    domainName: domain, 
                    domainOwner: credentials.accountId, 
                    repositoryName: repository, 
                    packageName, 
                    packageNamespace: namespace, 
                    packageFormat: format,
                    packageVersionState: 'Redeploy',
                    packageVersion: version, 
                    lambdaRegion,
                    lambdaFunctionName
                });
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error deploying lambda');
    }
  });

const eventBridgeFormSlice = createSlice({
    name: 'eventBridgeForm',
    initialState,
    reducers: {
      setEBBus(state, action: PayloadAction<string>) {
        state.ebBus = action.payload;
      },
      setEBSource(state, action: PayloadAction<string>) {
        state.ebSource = action.payload;
      },
      setDetailType(state, action: PayloadAction<string>) {
        state.detailType = action.payload;
      },
      resetAll(state) {
        Object.assign(state, initialState);
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(requestDeployment.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(requestDeployment.fulfilled, (state, action) => {
          state.loading = false;
          state.deployResult = action.payload;
        })
        .addCase(requestDeployment.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to deploy lambda';
        })
        .addCase(listEventBuses.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(listEventBuses.fulfilled, (state, action) => {
          state.loading = false;
          state.eventBuses = action.payload;
        })
        .addCase(listEventBuses.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch event buses';
        });
    },
  });
  
  export const {
    setEBBus,
    setEBSource,
    setDetailType,
    resetAll
  } = eventBridgeFormSlice.actions;
  
  export default eventBridgeFormSlice.reducer;
  