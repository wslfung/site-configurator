'use client';

import { useDispatch } from 'react-redux';
import { Box, Container, IconButton, Typography, TextField, Paper, Button, Checkbox, FormControlLabel } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
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
  // LocalStorage keys
  const FROM_EMAIL_KEY = 'ses-send-from-email';
  const TO_EMAIL_KEY = 'ses-send-to-email';
  const DATA_KEY = 'ses-send-data';
  const [saveFromEmail, setSaveFromEmail] = useState(() => !!localStorage.getItem(FROM_EMAIL_KEY));
  const [saveToEmail, setSaveToEmail] = useState(() => !!localStorage.getItem(TO_EMAIL_KEY));
  const [saveData, setSaveData] = useState(() => !!localStorage.getItem(DATA_KEY));
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

  useState(() => {
    if (saveFromEmail) setValue('FromEmail', localStorage.getItem(FROM_EMAIL_KEY) || '');
    if (saveToEmail) setValue('ToEmail', localStorage.getItem(TO_EMAIL_KEY) || '');
    if (saveData) setValue('Data', localStorage.getItem(DATA_KEY) || '');
  });

  const handleSend = async (data: SendSESFormData, templateName: string, region: string) => {
    console.log('Sending email with data:', data, 'Template:', templateName, 'Region:', region);

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
  }
  
  const handleFromEmailChange = (value: string) => {
    if (saveFromEmail) localStorage.setItem(FROM_EMAIL_KEY, value);
  };
  const handleToEmailChange = (value: string) => {
    if (saveToEmail) localStorage.setItem(TO_EMAIL_KEY, value);
  };
  const handleDataChange = (value: string) => {
    if (saveData) localStorage.setItem(DATA_KEY, value);
  };

  const handleSaveFromEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaveFromEmail(event.target.checked);
    if (!event.target.checked) {
      resetField('FromEmail');
      localStorage.removeItem(FROM_EMAIL_KEY);
    } else {
      localStorage.setItem(FROM_EMAIL_KEY, getValues('FromEmail'));
    }
  };
  const handleSaveToEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaveToEmail(event.target.checked);
    if (!event.target.checked) {
      resetField('ToEmail');
      localStorage.removeItem(TO_EMAIL_KEY);
    } else {
      localStorage.setItem(TO_EMAIL_KEY, getValues('ToEmail'));
    }
  };
  const handleSaveData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaveData(event.target.checked);
    if (!event.target.checked) {
      resetField('Data');
      localStorage.removeItem(DATA_KEY);
    } else {
      localStorage.setItem(DATA_KEY, getValues('Data'));
    }
  };

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
            <IconButton aria-label='change template' sx={{ float: 'right' }} onClick={() => electronRouter.navigate('/ses')}><EditIcon/></IconButton>
            <Typography variant="body1" gutterBottom>
              Template: <S>{selectedTemplate?.TemplateName}</S>
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
                <TextField fullWidth label="From Email" {...field} sx={{ mb: 2 }} error={!!errors.FromEmail} helperText={errors.FromEmail?.message}
                  onChange={e => {
                    field.onChange(e);
                    handleFromEmailChange(e.target.value);
                  }}
                />
              )}
            />
            <FormControlLabel
              control={<Checkbox checked={saveFromEmail} onChange={handleSaveFromEmail} />}
              label="Remember"
              sx={{ ml: 2 }}
            />
          </Box>
          <Box id="to-email" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Controller
              name="ToEmail"
              control={control}
              rules={{ required: 'To Email is required' }}
              render={({ field }) => (
                <TextField fullWidth label="To Email (Comma separated)" {...field} sx={{ mb: 2 }} error={!!errors.ToEmail} helperText={errors.ToEmail?.message}
                  onChange={e => {
                    field.onChange(e);
                    handleToEmailChange(e.target.value);
                  }}
                />
              )}
            />
            <FormControlLabel
              control={<Checkbox checked={saveToEmail} onChange={handleSaveToEmail} />}
              label="Remember"
              sx={{ ml: 2 }}
            />
          </Box>
          <Box id="data" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Controller
              name="Data"
              control={control}
              rules={{}}
              render={({ field }) => (
                <TextField fullWidth label="Data (JSON)" multiline rows={4} {...field} sx={{ mb: 2 }} error={!!errors.Data} helperText={errors.Data?.message}
                  onChange={e => {
                    field.onChange(e);
                    handleDataChange(e.target.value);
                  }}
                />
              )}
            />
            <FormControlLabel
              control={<Checkbox checked={saveData} onChange={handleSaveData} />}
              label="Remember"
              sx={{ ml: 2 }}
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