import { AWSCredentialsFormData } from './awsCredentialsForm';

declare global {
  interface Window {
    electronAPI?: {
      loadPage: (path: string) => void;
      encryptString: (plainText: string) => Promise<string | null>;
      decryptString: (encryptedBase64: string) => Promise<string | null>;
      getAWSCredentials: () => Promise<AWSCredentialsFormData | undefined>;
      setAWSCredentials: (data: AWSCredentialsFormData) => Promise<void>;
      setTitle: (title: string) => void;
    };
  }
}
