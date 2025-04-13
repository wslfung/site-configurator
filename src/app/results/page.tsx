'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { RootState } from '@/store/reduxStore';

export default function Results() {
  const formData = useSelector((state: RootState) => state.form);
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submitted Details
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Region:</strong> {formData.region}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Name:</strong> {formData.name}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Version:</strong> {formData.version}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Environment:</strong> {formData.environment}
          </Typography>
        </Paper>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/')}
          fullWidth
        >
          Back to Form
        </Button>
      </Box>
    </Container>
  );
}
