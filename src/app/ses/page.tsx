'use client';

import { FormControl, InputLabel, useTheme, Select, MenuItem, Button, TextField, Autocomplete, IconButton, Snackbar, Alert } from "@mui/material"
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAWSCredentials } from '@/hooks/useAWSCredentials';
import { Container, Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { SESTemplate } from '@/types/sesTemplate';
import { regions } from '@/utils/regions';
import { isSelected } from '@/utils/tools';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/reduxStore';
import {
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setSelectedTemplate,
    setSelectedRegion,
    resetAll // import the new action
} from '@/store/sesTemplateFormSlice';

interface SESFormData extends SESTemplate {
    SelectedRegion: string;
    SelectedTemplate: string;
    Operation: 'create' | 'update';
}
export default function SESPage() {
    const electronRouter = useElectronRouter();
    const [isAWSCredentialAvailable, setIsAWSCredentialAvailable] = useState(true);
    const { credentials, isLoading, error } = useAWSCredentials();
    const { control, getValues, setValue, resetField, watch, handleSubmit, formState: { errors }, reset } = useForm<SESFormData>({
        defaultValues: {
            SelectedRegion: 'none',
            SelectedTemplate: '',
            Operation: 'update',
            TemplateName: '',
            SubjectPart: '',
            HtmlPart: '',
            TextPart: '',
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const operation = watch('Operation'); // FIX: get operation from form state
    const dispatch = useDispatch<AppDispatch>();
    const {
        templates: templateNames,
        selectedTemplate,
        selectedRegion, // get from redux
        loading,
        error: sesError
    } = useSelector((state: RootState) => state.sesTemplateForm);

    const theme = useTheme();
    usePageTitle('SES Email Templates');

    useEffect(() => {
        if (credentials && credentials.keyId && credentials.secretKey && credentials.accountId) {
            setIsAWSCredentialAvailable(true);
        } else {
            setIsAWSCredentialAvailable(false);
        }
    }, [isLoading, credentials])

    // Watch for region changes and credentials loading state
    // useEffect(() => {
    //     if (isSelected(selectedRegion)) {
    //         dispatch(listTemplates({ region: selectedRegion }));
    //         dispatch(setSelectedTemplate(null));
    //         resetField('SelectedTemplate');
    //     }
    // }, [selectedRegion]);

    useEffect(() => {
        if (selectedTemplate) {
            setValue('TemplateName', selectedTemplate.TemplateName);
            setValue('SubjectPart', selectedTemplate.SubjectPart);
            setValue('TextPart', selectedTemplate.TextPart);
            setValue('HtmlPart', selectedTemplate.HtmlPart);
        }
    }, [selectedTemplate]);

    const handleSelectRegion = (region: string) => {
      if (isSelected(region)) {
        console.log("Selected region:", region);
        setValue('SelectedRegion', region);
        dispatch(setSelectedRegion(region));
        dispatch(listTemplates({ region }));
        dispatch(setSelectedTemplate(null));
        resetField('SelectedTemplate');
      }
    }

    const handleSelectTemplate = (templateName: string | null) => {
        console.log('Selected template:', templateName);

        if (!templateName) {
          console.log('No template selected');
            dispatch(setSelectedTemplate(null));
            resetField('SelectedTemplate');
            resetField('TemplateName');
            resetField('SubjectPart');
            resetField('TextPart');
            resetField('HtmlPart');
            return;
        } else {
            console.log('Fetching template:', templateName);
            dispatch(getTemplate({ region: selectedRegion, templateName }));
        }
        setValue('SelectedTemplate', templateName);
    }

    const handleSave = async (data: SESFormData) => {
        try {
            if (data.Operation === 'create') {
              console.log('Creating template:', data);
                await dispatch(createTemplate({ region: data.SelectedRegion, template: data })).unwrap();
                await window.electronAPI?.openMessageDialog("Template created successfully", 'Create SES Template', [], 'info');
                electronRouter.navigate('/');
            } else if (data.Operation === 'update') {
                await dispatch(updateTemplate({ region: data.SelectedRegion, template: data })).unwrap();
                await window.electronAPI?.openMessageDialog("Template updated successfully", 'Update SES Template', [], 'info');
                electronRouter.navigate('/');
            } else {
                await window.electronAPI?.openMessageDialog("Failed to save template: No credentials available", 'Save SES Template', [], 'error');
            }
        } catch (err) {
            await window.electronAPI?.openMessageDialog("Failed to save template", 'Save SES Template', [], 'error');
        }
    };

    const handleDelete = async () => {
        if (selectedTemplate && isSelected(selectedTemplate.TemplateName)) {
            try {
                await dispatch(deleteTemplate({ region: selectedRegion, templateName: selectedTemplate.TemplateName })).unwrap();
                await window.electronAPI?.openMessageDialog("Template deleted successfully", 'Delete SES Template', [], 'info');
                electronRouter.navigate('/');
            } catch (err) {
                await window.electronAPI?.openMessageDialog("Failed to delete template", 'Delete SES Template', [], 'error');
            }
        } else if (error) {
            await window.electronAPI?.openMessageDialog("Failed to delete template: No credentials available", 'Delete SES Template', [], 'error');
        }
    };

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Snackbar
                    open={!isAWSCredentialAvailable}
                    message="AWS Credentials not available"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Alert severity="error" sx={{ width: '100%' }}>
                        Please configure AWS credentials first.  Go to <Button variant="text" onClick={() => electronRouter.navigate('/settings')}>Settings</Button> to configure.
                    </Alert>
                </Snackbar>
                <Box className="img-background" sx={{ backgroundImage: `url("./aws-ses.svg")` }} />
                <Box sx={{ display: 'block', minHeight: '70vh', opacity: 0.9, zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <IconButton sx={{ float: 'left', mr: 2 }} onClick={() => 
                          {
                            dispatch(resetAll());
                            electronRouter.navigate('/')
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
                            await handleSave(data);
                        } catch (error) {
                            console.error('Failed to save template:', error);
                            await window.electronAPI?.openMessageDialog("Failed to save template", 'Save SES Template', [], 'error')
                        } finally {
                            setIsSubmitting(false);
                        }
                    })}>
                        <Box id="region-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <FormControl fullWidth sx={{ mt: 4 }}>
                                <InputLabel>Region</InputLabel>
                                <Select
                                    value={selectedRegion}
                                    onChange={(e) => handleSelectRegion(e.target.value)}
                                    label="Region"
                                    sx={{ width: '100%' }}
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                >
                                    <MenuItem value="none">Please select a region</MenuItem>
                                    {regions.map((region) => (
                                        <MenuItem key={region} value={region}>
                                            {region}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box id="template-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            {(isSelected(selectedRegion) && templateNames.length > 0 && operation === 'update') ? (
                                <Controller
                                    name="SelectedTemplate"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Autocomplete
                                            {...field}
                                            sx={{ mr: 2, flexGrow: 1 }}
                                            options={templateNames}
                                            value={selectedTemplate ? selectedTemplate.TemplateName : null}
                                            onChange={(event, newValue) => { 
                                              console.log('Selected template:', newValue);
                                              return handleSelectTemplate(newValue)
                                             }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Template"
                                                    placeholder="Search templates..."
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                />
                                            )}
                                        />)}
                                />

                            ) : isSelected(selectedRegion) && operation === 'update' && (
                                <Typography variant="body1" sx={{}}>There are no templates in this region</Typography>
                            )}
                            {getValues('SelectedTemplate') && (
                                <></>
                            )}
                            <Box sx={{ float: 'right', ml: 2}}>
                                {isSelected(selectedRegion) && !isSelected(selectedTemplate? selectedTemplate.TemplateName:null) && operation === 'update' && (<Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => { setValue('Operation', 'create'); resetField('SelectedTemplate') }} sx={{}}>New</Button>)}
                                {isSelected(selectedRegion) && isSelected(selectedTemplate? selectedTemplate.TemplateName: null) && (<Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={(e) => { e.preventDefault(); handleDelete(); }}>Delete</Button>)}
                                {isSelected(selectedRegion) && isSelected(selectedTemplate? selectedTemplate.TemplateName: null) && (<Button variant="contained" sx={{ml: 2}} color="primary" startIcon={<SendIcon />} onClick={(e) => { e.preventDefault(); electronRouter.navigate('/ses-send'); }}>Send with Template</Button>)}
                            </Box>
                        </Box>
                        {((isSelected(selectedRegion) && operation === 'create') ||
                            (isSelected(selectedRegion) && operation === 'update' && isSelected(selectedTemplate ? selectedTemplate.TemplateName : null))) &&
                            (
                                <Box id="template-form-fields">
                                    {operation === 'create' && (
                                        <Controller
                                            name="TemplateName"
                                            control={control}
                                            rules={{ required: 'Template name is required' }}
                                            render={({ field }) => (
                                                <TextField fullWidth label="Template Name" {...field} sx={{ mb: 2 }} error={!!errors.TemplateName} helperText={errors.TemplateName?.message} />
                                            )}
                                        />
                                    )}
                                    <Controller
                                        name="SubjectPart"
                                        control={control}
                                        rules={{ required: 'Subject is required' }}
                                        render={({ field }) => (
                                            <TextField fullWidth label="Subject" {...field} sx={{ mb: 2 }} error={!!errors.SubjectPart} helperText={errors.SubjectPart?.message} />
                                        )}
                                    />
                                    <Controller
                                        name="TextPart"
                                        control={control}
                                        rules={{ required: 'Text is required' }}
                                        render={({ field }) => (
                                            <TextField fullWidth label="Text" {...field} multiline rows={4} sx={{ mb: 2 }} error={!!errors.TextPart} helperText={errors.TextPart?.message} />
                                        )}
                                    />
                                    <Controller
                                        name="HtmlPart"
                                        control={control}
                                        rules={{ required: 'HTML is required' }}
                                        render={({ field }) => (
                                            <TextField fullWidth label="HTML" multiline rows={12} {...field} sx={{ mb: 2 }} error={!!errors.HtmlPart} helperText={errors.HtmlPart?.message} />
                                        )}
                                    />
                                    <Button type="submit" variant="contained" color="primary" sx={{ float: 'right', ml: 2, mr: 2 }} startIcon={<SaveIcon />} disabled={isSubmitting}>
                                        Save
                                    </Button>
                                </Box>
                            )}
                        <Box>
                            {operation === 'create' && isSelected(selectedRegion) && (<Button variant="contained" color="warning" sx={{ float: 'right' }} startIcon={<ClearIcon />} onClick={() => { setValue('Operation', 'update') }}>Cancel Create</Button>)}
                        </Box>
                    </form>
                </Box>
                <Box sx={{ mt: 2 }}>
                </Box>
            </Container >
        </>
    )
}