'use client';

import { Box, Button, Container, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { useElectronRouter } from '@/utils/useElectronRouter';
import { AWSCredentialsFormData } from '@/types/awsCredentialsForm';
import { useForm } from 'react-hook-form';
import { usePageTitle } from '@/utils/usePageTitle';
import { useDispatch } from 'react-redux';
import { setFormData } from '@/store/awsCredentialsFormSlice';

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  usePageTitle('Settings ');
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AWSCredentialsFormData>({
  });

  const electronRouter = useElectronRouter();

  const handleCancel = () => {
    electronRouter.navigate('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    const loadStoredData = async () => {
      setIsLoading(true);
      try {
        if (window.electronAPI) {
          const storedData = await window.electronAPI.getAWSCredentials();
          if (storedData) {
            const decryptedString = storedData.secretKey ? 
              await window.electronAPI.decryptString(storedData.secretKey) : '';
            
            // dispatch(setFormData({
            //   ...storedData,
            //   secretKey: decryptedString || ''
            // }));
            
            reset({
              ...storedData,
              secretKey: decryptedString || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, [reset]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ display: 'flex', minHeight: '70vh' }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          <Tab label="AWS Credentials" />
          <Tab label="Appearance" />
          <Tab label="Advanced" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Typography variant="h6" gutterBottom>
            AWS Credentials
          </Typography>
          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : (
          <Box>
            {/* Using react-hook-form */}
            <form onSubmit={handleSubmit(async (data) => {
              const encryptedSecretKey = await window.electronAPI?.encryptString(data.secretKey);
              if (encryptedSecretKey && window.electronAPI) {
                const formData: AWSCredentialsFormData = {
                  accountId: data.accountId,
                  keyId: data.keyId,
                  secretKey: encryptedSecretKey,
                };
                await window.electronAPI.setAWSCredentials(formData);
                dispatch(setFormData(formData));
                electronRouter.navigate('/');
              }
            })}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  {...register('accountId', {
                    required: 'Account ID is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Account ID must be numeric'
                    }
                  })}
                  label="Account ID"
                  type="number"
                  error={!!errors.accountId}
                  helperText={errors.accountId?.message}
                />
                <TextField
                  {...register('keyId', {
                    required: 'Key ID is required',
                    pattern: {
                      value: /^[a-zA-Z0-9]+$/,
                      message: 'Key ID must be alphanumeric'
                    }
                  })}
                  label="Key ID"
                  error={!!errors.keyId}
                  helperText={errors.keyId?.message}
                />
                <TextField
                  {...register('secretKey', {
                    required: 'Secret Key is required',
                    pattern: {
                      value: /^[a-zA-Z0-9]+$/,
                      message: 'Secret Key must be alphanumeric'
                    }
                  })}
                  label="Secret Key"
                  type="password"
                  error={!!errors.secretKey}
                  helperText={errors.secretKey?.message}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ float: 'right', marginTop: 20}}
              >
                Save Changes
              </Button>
            </form>
          </Box>
          )}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom>
            Appearance Settings
          </Typography>
          {/* Add your form fields here */}
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>
            Advanced Settings
          </Typography>
          {/* Add your form fields here */}
        </TabPanel>
      </Paper>
      <Box>
        <Button
          variant="contained"
          color="warning"
          onClick={() => {
            console.log('Cancel button clicked');
            handleCancel();
          }}
          sx={{ marginTop: 5, float: 'right', marginRight: 1 }}
        >
          Done
        </Button>
      </Box>

    </Container>
  );
}
