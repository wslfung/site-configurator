'use client';

import { Box, Button, Container, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTheme, TextField } from '@mui/material';
import { useElectronRouter } from '@/utils/useElectronRouter';
import { AWSCredentialsFormData } from '@/types/awsCredentialsForm';
import { usePageTitle } from '@/utils/usePageTitle';
import { useDispatch } from 'react-redux';
import { setFormData } from '@/store/awsCredentialsFormSlice';
import AWSCredentialsTabPanel from './awsCredentialsTabPanel';
import AppearancePanel from './appearancePanel';
import './settings.css';




export default function SettingsPage() {
  const theme = useTheme();
  usePageTitle('Settings ');
  const [value, setValue] = useState(0);
  const dispatch = useDispatch();
  
  const electronRouter = useElectronRouter();

  const handleCancel = () => {
    electronRouter.navigate('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box className="gear-background" />
      <Box sx={{ display: 'flex', minHeight: '70vh', opacity: 0.9, zIndex: 1 }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          <Tab label="AWS Credentials" />
          <Tab label="Appearance" />
        </Tabs>
        <AWSCredentialsTabPanel value={value} index={0} />
        <AppearancePanel value={value} index={1} />
      </Box>
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
