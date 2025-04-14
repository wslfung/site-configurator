import { AWSCredentialsFormData } from '../src/types/awsCredentialsForm';

type StoreType = {
  awsCredentials?: AWSCredentialsFormData;
  themePreference: 'light' | 'dark';
};

const schema = {
  awsCredentials: {
    type: 'object',
    properties: {
      accountId: { type: 'string' },
      keyId: { type: 'string' },
      secretKey: { type: 'string' }
    },
    required: ['accountId', 'keyId', 'secretKey']
  },
  themePreference: {
    type: 'string',
    enum: ['light', 'dark']
  }
} as const;

let store: any;

export const initStore = async () => {
  const Store = (await import('electron-store')).default;
  store = new Store<StoreType>({
    schema,
    clearInvalidConfig: true
  });
  return store;
};

export type ElectronStore = typeof store;
export default store;
