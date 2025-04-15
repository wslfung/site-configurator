'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { Container, Box, Typography, IconButton, useTheme, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useForm } from 'react-hook-form';
import { LambdaFormData } from '@/types/lambdaForm';
import './lambda.css';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { regions } from '@/utils/regions';

let imagePath = "./aws-lambda.svg";
if (process.env.NODE_ENV === 'development') {
  imagePath = "../aws-lambda.svg";
}

export default function LambdaPage() {
    const electronRouter = useElectronRouter();
    const { control, getValues, setValue, resetField, watch, handleSubmit, formState: { errors }, reset } = useForm<LambdaFormData>({});

    const theme = useTheme();
    usePageTitle('AWS Lambda Deployment');
    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box className="lambda-background" sx={{backgroundImage: `url("${imagePath}")`}} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <IconButton sx={{ float: 'left', mr: 2 }} onClick={() => electronRouter.navigate('/')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                        AWS Lambda Deployment
                    </Typography>
                </Box>
                <Box id="region-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <FormControl fullWidth sx={{ mt: 4 }}>
                        <InputLabel>Region</InputLabel>
                        <Select
                            value={getValues('region')}
                            onChange={(e) => setValue('region', e.target.value)}
                            label="Region"
                            sx={{ width: '100%' }}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                            <MenuItem value="none">Please select a region</MenuItem>
                            {regions.map((regionItem) => (
                                <MenuItem key={regionItem} value={regionItem}>
                                    {regionItem}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

            </Container>
        </>
    )
}
