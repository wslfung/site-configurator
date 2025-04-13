'use client';

import { Box, Button, Container, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TextField } from '@mui/material';
import { useElectronRouter } from '@/utils/navigation';
import { setFormData } from '@/store/awsCredentialsFormSlice';
import { AWSCredentialsFormData } from '@/types/awsCredentialsForm';



declare global {
  interface Window {
    electronAPI?: {
      loadPage: (path: string) => void;
      encryptString: (plainText: string) => Promise<string | null>;
      decryptString: (encryptedBase64: string) => Promise<string | null>;
      isEncryptionAvailable: () => boolean;
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
  const [value, setValue] = useState(0);
  const dispatch = useDispatch();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log("handleChange called")
    setValue(newValue);
  };

  const electronRouter = useElectronRouter();

  const handleCancel = () => {
    electronRouter.navigate('/');
  };

  const onAwsCredentialsFormSubmit = (data: AWSCredentialsFormData) => {
    console.log('Form submitted:', data);
    dispatch(setFormData(data));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ display: 'flex', minHeight: '70vh' }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          <Tab label="AWS Config" />
          <Tab label="Appearance" />
          <Tab label="Advanced" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Typography variant="h6" gutterBottom>
            AWS Config
          </Typography>
          <Box>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const accountId = formData.get('accountId');
              const keyId = formData.get('keyId');
              const secretKey = formData.get('secretKey');

              const accountIdValidate = /^[0-9]+$/;
              const keyIdValidate = /^[a-zA-Z0-9]+$/;
              const secretKeyValidate = /^[a-zA-Z0-9]+$/;

              if (!accountIdValidate.test(accountId as string)) {
                alert('Account ID must be numeric');
                return;
              }
              if (!keyIdValidate.test(keyId as string)) {
                alert('Key ID must be alphanumeric');
                return;
              }
              if (!secretKeyValidate.test(secretKey as string)) {
                alert('Secret Key must be alphanumeric');
                return;
              }

              (async () => {
                const encryptedSecretKey = await window.electronAPI?.encryptString(secretKey as string);
                if (encryptedSecretKey) {
                  dispatch(setFormData({
                    accountId,
                    keyId,
                    secretKey: encryptedSecretKey,
                  }));
                }
              })();
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Account ID"
                  name="accountId"
                  type="number"
                  required
                />
                <TextField
                  label="Key ID"
                  name="keyId"
                  required
                />
                <TextField
                  label="Secret Key"
                  name="secretKey"
                  type="password"
                  required
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

            <Button
              variant="contained"
              color="primary"
              sx={{ float: 'right', marginTop: 20}}
            >
              Save Changes
            </Button>
          </Box>
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
          Exit
        </Button>
      </Box>

    </Container>
  );
}
