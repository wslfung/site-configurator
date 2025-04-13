'use client';

import { useElectronRouter } from '@/utils/useElectronRouter';
import { Container, Box, Typography } from '@mui/material';
import { usePageTitle } from '@/utils/usePageTitle';
import { CustomButton } from '@/app/components/CustomButton';

export default function Home() {
  usePageTitle('Home');
  const electronRouter = useElectronRouter();

  return (
    <>
      <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Site Configurator
        </Typography>
          <CustomButton
          bgImage="/aws-ses.svg"
            type="button"
            fullWidth
            sx={{ mt: 5}}
            onClick={() => electronRouter.navigate('/results')}
          >
            <Typography sx={{ fontWeight: 'bold', fontSize: '1.4rem', paddingTop: '30px' }}>AWS Simple Email Service</Typography>
          </CustomButton>
          <CustomButton
            bgImage="/aws-lambda.svg"
            type="button"
            fullWidth
            sx={{ mt: 3, textAlign: 'left' }}
            onClick={() => electronRouter.navigate('/results')}
          >
            <Typography sx={{ fontWeight: 'bold', fontSize: '1.4rem', paddingTop: '30px' }}>AWS Lambda</Typography>
          </CustomButton>
      </Box>
    </Container>
    </>
  );
}
