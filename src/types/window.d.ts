import { AWSCredentials } from '@/types/awsCredentials';

declare global {
  interface Window {
    electronAPI?: {
      loadPage: (path: string) => void;
      encryptString: (plainText: string) => Promise<string | null>;
      decryptString: (encryptedBase64: string) => Promise<string | null>;
      getAWSCredentials: () => Promise<AWSCredentials | undefined>;
      setAWSCredentials: (data: AWSCredentials) => Promise<void>;
      getThemePreference: () => Promise<'light' | 'dark'>;
      setThemePreference: (data: 'light' | 'dark') => Promise<void>;
      setTitle: (title: string) => void;
      openMessageDialog: (message: string, title: string, buttons: string[], type: 'info' | 'warning' | 'error' | 'question') => Promise<void>;
    };
  }
}