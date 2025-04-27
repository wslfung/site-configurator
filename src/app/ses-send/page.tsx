'use client';

import { useDispatch } from 'react-redux';
import { Box, Container, IconButton, Typography, TextField, Paper, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { RootState, AppDispatch } from '@/store/reduxStore';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { sendTemplatedEmail } from '@/store/sesTemplateFormSlice';
import { S } from '@/utils/tools';


interface SendSESFormData {
  FromEmail: string;
  ToEmail: string;
  Data: string;
}

export default function SendSesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const electronRouter = useElectronRouter();
  const theme = useTheme();
  usePageTitle('Send SES Email With Template');
  const {
    selectedTemplate,
    selectedRegion, // get from redux
  } = useSelector((state: RootState) => state.sesTemplateForm);
  const { control, getValues, setValue, resetField, watch, handleSubmit, formState: { errors }, reset } = useForm<SendSESFormData>({
    defaultValues: {
      FromEmail: '',
      ToEmail: '',
      Data: '',
    }
  });

  const handleSend = async (data: SendSESFormData, templateName: string, region: string) => {
    alert('Sending email with data:' + JSON.stringify(data) + ' Template:' + templateName + ' Region:' + region);
    await dispatch(sendTemplatedEmail({
      region: region,
      params: {
        source: data.FromEmail,
        toAddresses: data.ToEmail.split(','),
        templateName: templateName,
        templateData: data.Data? JSON.parse(data.Data): {},
      }
    }));
    await window.electronAPI?.openMessageDialog("Email sent successfully", 'Send SES Email', [], 'info')
    electronRouter.navigate('/ses');
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box className="img-background" sx={{ backgroundImage: `url("./aws-ses.svg")` }} />
        <Box sx={{ display: 'block', minHeight: '70vh', opacity: 0.9, zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <IconButton sx={{ float: 'left', mr: 2 }} onClick={() => {
              electronRouter.navigate('/ses')
            }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
              SES Email Templates
            </Typography>
          </Box>
        
        <form onSubmit={handleSubmit(async (data) => {
          setIsSubmitting(true);
          try {
            await handleSend(data, selectedTemplate?.TemplateName || '', selectedRegion);
          } catch (error) {
            console.error('Failed to send SES:', error);
            await window.electronAPI?.openMessageDialog("Failed to save template", 'Save SES Template', [], 'error')
          } finally {
            setIsSubmitting(false);
          }
        })}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: theme.palette.background.paper, mb: 2, mt: 4 }}>
            <Typography variant="body1" gutterBottom>
              Send Email Using Template: <S>{selectedTemplate?.TemplateName}</S>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Region: <S>{selectedRegion}</S>
            </Typography>
          </Paper>
          <Box id="from-email" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, mb: 2 }}>
            <Controller
              name="FromEmail"
              control={control}
              rules={{ required: 'From Email is required' }}
              render={({ field }) => (
                <TextField fullWidth label="From Email" {...field} sx={{ mb: 2 }} error={!!errors.FromEmail} helperText={errors.FromEmail?.message} />
              )}
            />
          </Box>
          <Box id="to-email" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Controller
              name="ToEmail"
              control={control}
              rules={{ required: 'To Email is required' }}
              render={({ field }) => (
                <TextField fullWidth label="To Email (Comma separated)" {...field} sx={{ mb: 2 }} error={!!errors.ToEmail} helperText={errors.ToEmail?.message} />
              )}
            />
          </Box>
          <Box id="data" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Controller
              name="Data"
              control={control}
              rules={{}}
              render={({ field }) => (
                <TextField fullWidth label="Data (JSON)" multiline rows={4} {...field} sx={{ mb: 2 }} error={!!errors.Data} helperText={errors.Data?.message} />
              )}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" sx={{ float: 'right', ml: 2, mr: 2 }} startIcon={<SendIcon />} disabled={isSubmitting}>
            Send
          </Button>

        </form>
        </Box>
      </Container>

    </>
  );
}