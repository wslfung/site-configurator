'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { Container, Box, Typography, IconButton, useTheme, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useForm, Controller } from 'react-hook-form';
import { LambdaDeployFormData } from '@/types/lambdaForm';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { regions } from '@/utils/regions';
import { useAWSCredentials } from '@/hooks/useAWSCredentials';
import { useEffect, useState } from 'react';
import { isSelected } from '@/utils/tools';
import CodeArtifactSection from './codeArtifactSection';
import LambdaSection from './lambdaSection';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/reduxStore';
import {
    setTargetRegion, setCredentials, setLambdaFunctionName,
    fetchLambdaFunctions, deployLambda
} from '@/store/lambdaFormSlice';

export default function LambdaPage() {
    const [activeStep, setActiveStep] = useState(0);
    const electronRouter = useElectronRouter();
    const dispatch = useDispatch<AppDispatch>();
    const {
        targetRegion, lambdaFunctionName,
        lambdaFunctions, deployResult, loading, error: lambdaError
    } = useSelector((state: RootState) => state.lambdaForm);
    const { control, getValues, setValue, resetField, watch, handleSubmit, formState: { errors }, reset } = useForm<LambdaDeployFormData>({
        defaultValues: {
            targetRegion: 'none',
            lambdaFunctionName: ''
        }
    });

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const theme = useTheme();
    usePageTitle('AWS Lambda Deployment');

    const handleLambdaDeployment = () => {
        // if (!credentials) {
        //     window.electronAPI?.openMessageDialog('Unable to deploy, no credentials available', 'Error', ['OK'], 'error');
        //     return;
        // }
        // Find the package object to get namespace/format if available
        // const pack = packages.find(pkg => pkg.name === codePackage);
        // dispatch(deployLambda({
        //     region,
        //     credentials,
        //     domain,
        //     repository,
        //     packageName: codePackage,
        //     namespace: pack?.namespace || '',
        //     format: pack?.format || 'generic',
        //     version,
        //     targetRegion,
        //     lambdaFunctionName
        // }));
    }

    useEffect(() => {
        if (deployResult) {
            window.electronAPI?.openMessageDialog('Lambda deployment requested successfully', 'Success', ['OK'], 'info');
        }
    }, [deployResult]);

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box className="img-background" sx={{ backgroundImage: `url("./aws-lambda.svg")` }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 4 }}>
                    <IconButton sx={{ float: 'left', mr: 2 }} onClick={() => electronRouter.navigate('/')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                        AWS Lambda Deployment
                    </Typography>
                </Box>
                <form onSubmit={handleSubmit(() => {
                    handleLambdaDeployment();
                })}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '95%'}}>
                        <Stepper activeStep={activeStep} orientation="vertical" sx={{ width: '90%', display: 'flex', justifyContent: 'center'}}>
                            <Step key="code-artifact">
                                <CodeArtifactSection collapse={activeStep !== 0} control={control} setValue={setValue} resetField={resetField} nextStep={handleNext} previousStep={handleBack} />
                            </Step>
                            <Step key="lambda">
                                <LambdaSection collapse={activeStep !== 1} control={control} setValue={setValue} resetField={resetField} nextStep={handleNext} previousStep={handleBack} />
                            </Step>
                            <Step key="event-bridge">
                                <StepLabel>Event Bridge</StepLabel>
                                <StepContent>
                                    <p>This is placeholder for Event Bridge step</p>
                                </StepContent>
                            </Step>
                        </Stepper>
                    </Box>
                    {/* <Box sx={{ float: 'right' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<FileUploadIcon />}
                        >
                            REQUEST DEPLOYMENT
                        </Button>
                    </Box> */}
                </form>
            </Container>
        </>
    )
}
