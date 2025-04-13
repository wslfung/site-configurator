'use client';

import Image from "next/image";
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { TextField, Button, Container, Box, Typography } from '@mui/material';
import { setFormData } from '@/store/formSlice';
import { FormData } from '@/types/form';

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const dispatch = useDispatch();
  const router = useRouter();

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    dispatch(setFormData(data));
    router.push('/results');
  };

  return (
    <>
      <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Enter Details
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={37}
            priority
          />
          <TextField
            {...register('name', { required: 'Name is required' })}
            fullWidth
            label="Name"
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register('version', { required: 'Version is required' })}
            fullWidth
            label="Version"
            margin="normal"
            error={!!errors.version}
            helperText={errors.version?.message}
          />
          <TextField
            {...register('environment', { required: 'Environment is required' })}
            fullWidth
            label="Environment"
            margin="normal"
            error={!!errors.environment}
            helperText={errors.environment?.message}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </form>
        {/* <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => router.push('/settings')}
        >
          Cancel
        </Button> */}
      </Box>
    </Container>
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: -1
        }}
      >
        <Image
          src="/gear.svg"
          alt="Settings"
          width={500}
          height={500}
          priority
        />
      </Box>
    </>
  );
}
