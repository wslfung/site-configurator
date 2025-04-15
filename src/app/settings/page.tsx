'use client';

import { Box, Button, Container, Tab, Tabs, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useTheme } from '@mui/material';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { usePageTitle } from '@/hooks/usePageTitle';
import AWSCredentialsTabPanel from './awsCredentialsTabPanel';
import AppearancePanel from './appearancePanel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


export default function SettingsPage() {
  const theme = useTheme();
  usePageTitle('Settings ');
  const [value, setValue] = useState(0);

  const electronRouter = useElectronRouter();

  const handleCancel = () => {
    electronRouter.navigate('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box className="img-background" sx={{backgroundImage: `url("./gear.svg")`, backgroundSize: '550px'}} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <IconButton sx={{ float: 'left', mr: 2 }} onClick={() => electronRouter.navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
          Settings
        </Typography>
      </Box>
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
    </Container>
  );
}
