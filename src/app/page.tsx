'use client';

import { useElectronRouter } from '@/hooks/useElectronRouter';
import { Container, Box, Typography } from '@mui/material';
import { usePageTitle } from '@/hooks/usePageTitle';
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
            bgimage="aws-ses.svg"
            type="button"
            fullWidth
            sx={{ mt: 5}}
            onClick={() => electronRouter.navigate('/ses')}
          >
            <Typography fontFamily="Codystar" className='codystar-regular' sx={{ fontWeight: 'bold', fontSize: '1.4rem', paddingTop: '30px' }}>SES Email Templates</Typography>
          </CustomButton>
          <CustomButton
            bgimage="aws-lambda.svg"
            type="button"
            fullWidth
            sx={{ mt: 3, textAlign: 'left' }}
            onClick={() => electronRouter.navigate('/lambda')}
          >
            <Typography fontFamily="Codystar" className='codystar-regular' sx={{ fontWeight: 'bold', fontSize: '1.4rem', paddingTop: '30px' }}>AWS Lambda Deployment</Typography>
          </CustomButton>
      </Box>
    </Container>
    </>
  );
}
