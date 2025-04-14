'use client';

import { FormControl, InputLabel, useTheme, Select, MenuItem, Button, TextField, Autocomplete, IconButton } from "@mui/material"
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAWSCredentials } from '@/hooks/useAWSCredentials';
import { Container, Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { SESTemplateService } from '@/app/services/sesService';
import './ses.css';
import { useForm, Controller } from 'react-hook-form';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { SESTemplate } from '@/types/sesTemplate';

const regions: string[] = ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1', 'ap-south-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2', 'ca-central-1', 'sa-east-1'];
const isSelected = (value: string) => {
    return value && value !== 'none';
}

interface SESFormData extends SESTemplate {
    SelectedRegion: string;
    SelectedTemplate: string;
    Operation: 'create' | 'update';
}
export default function SESPage() {
    const electronRouter = useElectronRouter();
    const { credentials, isLoading, error } = useAWSCredentials();
    const [templateNames, setTemplateNames] = useState<string[]>([]);
    const { control, getValues, setValue, resetField, watch, handleSubmit, formState: { errors }, reset } = useForm<SESFormData>({
        defaultValues: {
            SelectedRegion: 'none',
            SelectedTemplate: 'none',
            Operation: 'update',
            TemplateName: '',
            SubjectPart: '',
            HtmlPart: '',
            TextPart: '',
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const selectedRegion = watch('SelectedRegion');
    const selectedTemplate = watch('SelectedTemplate');
    const operation = watch('Operation');

    const loadTemplates = async (region: string) => {
        if (!error && credentials) {
            try {
                const service = new SESTemplateService(region, credentials);
                const templates = await service.listTemplates();
                setTemplateNames(templates);
                resetField('SelectedTemplate');
            } catch (err) {
                console.error('Failed to load templates:', err);
            }
        } else if (error) {
            console.error('Failed to load AWS credentials:', error);
        }
    };

    const getTemplate = async (region: string, templateName: string) => {
        if (!error && credentials) {
            try {
                const service = new SESTemplateService(region, credentials);
                const template = await service.getTemplate(templateName);
                setValue('TemplateName', template.TemplateName);
                setValue('SubjectPart', template.SubjectPart);
                setValue('TextPart', template.TextPart);
                setValue('HtmlPart', template.HtmlPart);
                console.log(template);
            } catch (err) {
                console.error('Failed to get template:', err);
            }
        } else if (error) {
            console.error('Failed to load AWS credentials:', error);
        }
    };

    const handleSave = async (data: SESFormData) => {
        if (data.Operation === 'create' && credentials) {
            const service = new SESTemplateService(data.SelectedRegion, credentials);
            await service.createTemplate(data);
            alert('Template created successfully');
            electronRouter.navigate('/');
        } else if (data.Operation === 'update' && credentials) {
            const service = new SESTemplateService(data.SelectedRegion, credentials);
            await service.updateTemplate(data);
            alert('Template updated successfully');
            electronRouter.navigate('/');
        } else {
            console.error('Failed to save template: No credentials available');
        }
    }

    const theme = useTheme();
    usePageTitle('SES Email Templates');

    // Watch for region changes and credentials loading state
    useEffect(() => {
        if (!isLoading && isSelected(selectedRegion)) {
            loadTemplates(selectedRegion);
        }
    }, [isLoading, selectedRegion]);
    // Watch for template changes
    useEffect(() => {
        if (!isLoading && isSelected(selectedTemplate)) {
            getTemplate(selectedRegion, selectedTemplate)
        }
        if (!isLoading && !isSelected(selectedTemplate)) {
            resetField('TemplateName');
            resetField('SubjectPart');
            resetField('TextPart');
            resetField('HtmlPart');
        }
    }, [isLoading, selectedTemplate]);
    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box className="ses-background" />
                <Box sx={{ display: 'block', minHeight: '70vh', opacity: 0.9, zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <IconButton sx={{ float: 'left', mr: 2 }} onClick={() => electronRouter.navigate('/')}>
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
                        } finally {
                            setIsSubmitting(false);
                        }
                    })}>
                        <Box id="region-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <FormControl fullWidth sx={{ mt: 4 }}>
                                <InputLabel>Region</InputLabel>
                                <Select
                                    value={selectedRegion}
                                    onChange={(e) => setValue('SelectedRegion', e.target.value)}
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
                                            onChange={(event, newValue) => field.onChange(newValue)}
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
                            <Box sx={{ float: 'right', ml: 2 }}>
                                {isSelected(selectedRegion) && !isSelected(selectedTemplate) && operation === 'update' && (<Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => { setValue('Operation', 'create') }} sx={{}}>New</Button>)}
                                {isSelected(selectedRegion) && isSelected(selectedTemplate) && (<Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => { }}>Delete</Button>)}
                            </Box>
                        </Box>
                        {((isSelected(selectedRegion) && operation === 'create') ||
                            (isSelected(selectedRegion) && operation === 'update' && isSelected(selectedTemplate))) &&
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
                                            <TextField fullWidth label="Text" multiline {...field} sx={{ mb: 2 }} error={!!errors.TextPart} helperText={errors.TextPart?.message} />
                                        )}
                                    />
                                    <Controller
                                        name="HtmlPart"
                                        control={control}
                                        rules={{ required: 'HTML is required' }}
                                        render={({ field }) => (
                                            <TextField fullWidth multiline label="HTML" {...field} sx={{ mb: 2 }} error={!!errors.HtmlPart} helperText={errors.HtmlPart?.message} />
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