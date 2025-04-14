'use client';

import { FormControl, InputLabel, useTheme, Select, MenuItem, SelectChangeEvent, ButtonGroup, Button, IconButton, InputAdornment, TextField, Autocomplete } from "@mui/material"
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAWSCredentials } from '@/hooks/useAWSCredentials';
import { Container, Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { SESTemplateService } from '@/app/services/sesService';
import './ses.css';
import { useForm } from 'react-hook-form';
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
    const { credentials, isLoading, error } = useAWSCredentials();
    const [templateNames, setTemplateNames] = useState<string[]>([]);
    const { register, getValues, setValue, resetField, watch, handleSubmit, formState: { errors }, reset } = useForm<SESFormData>({
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
    }, [isLoading, selectedTemplate]);
    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box className="ses-background" />
                <Box sx={{ display: 'block', minHeight: '70vh', opacity: 0.9, zIndex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        SES Email Templates
                    </Typography>
                    <form>
                        <Box id="region-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
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
                        <Box id="template-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                            {(isSelected(selectedRegion) && templateNames.length > 0 && operation === 'update') ? (

                                <Autocomplete
                                    sx={{ mr: 2, flexGrow: 1 }}
                                    options={templateNames}
                                    value={isSelected(selectedTemplate) ? selectedTemplate : null}
                                    onChange={(_, newValue) => setValue('SelectedTemplate', newValue || 'none')}
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            label="Template"
                                            placeholder="Search templates..."
                                        />
                                    )}
                                />

                            ) : isSelected(selectedRegion) && operation === 'update' && (
                                <Typography variant="body1" sx={{ }}>There are no templates in this region</Typography>
                            )}
                            {getValues('SelectedTemplate') && (
                                <></>
                            )}
                            <Box sx={{ float: 'right', ml: 2 }}>
                                {isSelected(selectedRegion) && !isSelected(selectedTemplate) && operation === 'update' && (<Button variant="contained" color="primary" startIcon={<AddIcon/>} onClick={() => { setValue('Operation', 'create') }} sx={{ }}>New</Button>)}
                                {isSelected(selectedRegion) && isSelected(selectedTemplate) && (<Button variant="contained" color="error" startIcon={<DeleteIcon/>} onClick={() => { }}>Delete</Button>)}
                            </Box>
                        </Box>
                        <Box id="template-form-fields">

                        </Box>
                        <Box>
                        {operation === 'create' && isSelected(selectedRegion) && (<Button variant="contained" color="warning" sx={{ float: 'right' }} startIcon={<ClearIcon/>} onClick={() => { setValue('Operation', 'update') }}>Cancel Create</Button>)}
                        </Box>
                    </form>
                </Box>
                <Box sx={{ mt: 2 }}>
                </Box>
            </Container >
        </>
    )
}