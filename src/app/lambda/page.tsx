'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { Container, Box, Typography, IconButton, useTheme, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useForm } from 'react-hook-form';
import { LambdaDeployFormData } from '@/types/lambdaForm';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { useEffect, useState } from 'react';
import CodeArtifactSection from './codeArtifactSection';
import LambdaSection from './lambdaSection';
import EventBridgeSection from './eventBridgeSection';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/reduxStore';
import { requestDeployment, resetAll as resetEB } from '@/store/eventBridgeFormSlice';
import { resetAll as resetLambda } from '@/store/lambdaFormSlice';
import { resetAll as resetCodeArtifact } from '@/store/codeArtifactFormSlice';

export default function LambdaPage() {
    const [activeStep, setActiveStep] = useState(0);
    const electronRouter = useElectronRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { format, namespace } = useSelector((state: RootState) => state.codeArtifactForm);
    const { deployResult } = useSelector((state: RootState) => state.eventBridgeForm);
    const { control, getValues, setValue, resetField, watch, handleSubmit, formState: { errors }, reset } = useForm<LambdaDeployFormData>({
        defaultValues: {
            region: 'none',
            domain: 'none',
            name: 'none',
            repository: 'none',
            packageName: '',
            version: '',
            targetRegion: 'none',
            lambdaFunctionName: '',
            ebBus: 'none',
            ebSource: '',
            detailType: ''  
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

    const handleLambdaDeployment = (data: LambdaDeployFormData) => {
        dispatch(requestDeployment({
            region: data.region,
            domain: data.domain,
            repository: data.repository,
            packageName: data.packageName,
            namespace: namespace,
            format: format.toString(),
            version: data.version,
            lambdaRegion: data.targetRegion,
            lambdaFunctionName: data.lambdaFunctionName,
            ebBus: data.ebBus,
            ebSource: data.ebSource,
            detailType: data.detailType
        }));
    }

    useEffect(() => {
        if (deployResult) {
            window.electronAPI?.openMessageDialog('Lambda deployment requested successfully', 'Success', ['OK'], 'info');
            dispatch(resetLambda());
            dispatch(resetEB());
            dispatch(resetCodeArtifact());
            window.electronAPI?.loadPage('/');
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
                <form onSubmit={handleSubmit((data) => handleLambdaDeployment(data))}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '95%'}}>
                        <Stepper activeStep={activeStep} orientation="vertical" sx={{ width: '90%', display: 'flex', justifyContent: 'center'}}>
                            <Step key="code-artifact">
                                <CodeArtifactSection collapse={activeStep !== 0} control={control} setValue={setValue} resetField={resetField} nextStep={handleNext} previousStep={handleBack} />
                            </Step>
                            <Step key="lambda">
                                <LambdaSection collapse={activeStep !== 1} control={control} setValue={setValue} resetField={resetField} nextStep={handleNext} previousStep={handleBack} />
                            </Step>
                            <Step key="event-bridge">
                                <EventBridgeSection collapse={activeStep !== 2} control={control} setValue={setValue} resetField={resetField} errors={errors} watch={watch} nextStep={handleNext} previousStep={handleBack} />
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
