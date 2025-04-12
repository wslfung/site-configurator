'use client';

import { Box, Button, Container, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useElectronRouter } from '@/utils/navigation';


declare global {
  interface Window {
    electronAPI?: {
      loadPage: (path: string) => void;
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
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log("handleChange called")
    setValue(newValue);
  };

  const electronRouter = useElectronRouter();

  const handleCancel = () => {
    electronRouter.navigate('/');
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
          <Tab label="General" />
          <Tab label="Appearance" />
          <Tab label="Advanced" />
        </Tabs>

          <TabPanel value={value} index={0}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Box>
              <Button 
                variant="outlined" 
                onClick={() => {
                  console.log('Cancel button clicked');
                  handleCancel();
                }}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
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
    </Container>
  );
}
