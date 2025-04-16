import { Controller, Control, UseFormSetValue, UseFormResetField, UseFormWatch } from 'react-hook-form';
import { StepLabel, StepContent, Box, FormControl, InputLabel, MenuItem, Select, TextField, Button } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { LambdaDeployFormData } from '@/types/lambdaForm';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/reduxStore';
import { useEffect } from 'react';
import { isSelected } from '@/utils/tools';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/reduxStore';
import { listEventBuses } from '@/store/eventBridgeFormSlice';
import ConditionalDisplay from '../components/ConditionalDisplay';
import { setEBBus, setEBSource, setDetailType } from '@/store/eventBridgeFormSlice';
import { S } from '@/utils/tools';

export default function EventBridgeSection({ collapse, control, setValue, resetField, errors, watch, nextStep, previousStep }: { collapse: boolean, control: Control<LambdaDeployFormData, any, LambdaDeployFormData>, setValue: UseFormSetValue<LambdaDeployFormData>, resetField: UseFormResetField<LambdaDeployFormData>, errors: any, watch: UseFormWatch<LambdaDeployFormData>, nextStep: () => void, previousStep: () => void }) {
    const { region } = useSelector((state: RootState) => state.codeArtifactForm);
    const { eventBuses, ebSource, ebBus, detailType, loading } = useSelector((state: RootState) => state.eventBridgeForm);
    const dispatch = useDispatch<AppDispatch>();
    
    useEffect(() => {
        if (!collapse && isSelected(region)) {
            dispatch(listEventBuses({ region }));
        }
    }, [region, collapse]);

    const handleEBBusChange = (value: string) => {
        dispatch(setEBBus(value));
        setValue('ebBus', value);
    };
    const handleEBSourceChange = (value: string) => {
        dispatch(setEBSource(value));
        setValue('ebSource', value);
    };
    const handleEBDetailTypeChange = (value: string) => {
        dispatch(setDetailType(value));
        setValue('detailType', value);
    };

    return (
        <>
            <StepLabel>
                <ConditionalDisplay condition={!collapse}>
                    EventBridge Details
                </ConditionalDisplay>
                <ConditionalDisplay condition={collapse}>
                    <b>EventBridge:</b> region: <S>{region}</S>, bus: <S>{ebBus}</S>, source: <S>{ebSource}</S>, detail type: <S>{detailType}</S>
                </ConditionalDisplay>
            </StepLabel>
            <StepContent>
                <Box id="eventBridge-selection" sx={{ mb: 2, mt: 4 }}>
                    <ConditionalDisplay condition={eventBuses.length > 0} >

                        <FormControl fullWidth>
                            <InputLabel>Event Bus</InputLabel>
                            <Controller
                                name="ebBus"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label="Event Bus"
                                        sx={{ width: '100%' }}
                                        disabled={loading}
                                        value={ebBus}
                                        onChange={(e) => {
                                            handleEBBusChange(e.target.value);
                                        }}
                                    >
                                        <MenuItem value="none">Select an Event Bus</MenuItem>
                                        {eventBuses.map((bus) => (
                                            <MenuItem key={bus} value={bus}>
                                                {bus}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                    </ConditionalDisplay>
                    <ConditionalDisplay condition={eventBuses.length === 0} >No event bus found.</ConditionalDisplay>
                </Box>
                <Box id="eventBridge-details" sx={{ mb: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2, width: '100%' }}>
                        <Controller
                            name="ebSource"
                            control={control}
                            rules={{ required: 'Event source is required' }}
                            render={({ field }) => (
                                <TextField label="Event Source" value={ebSource} onChange={(e) => handleEBSourceChange(e.target.value)} sx={{ flexGrow: 1 }} error={!!errors.ebSource} helperText={errors.ebSource?.message} />
                            )}
                        />
                        <Controller
                            name="detailType"
                            control={control}
                            rules={{ required: 'Detail type is required' }}
                            render={({ field }) => (
                                <TextField label="Detail Type" value={detailType} onChange={(e) => handleEBDetailTypeChange(e.target.value)} sx={{ flexGrow: 2 }} error={!!errors.detailType} helperText={errors.detailType?.message} />
                            )}
                        />
                </Box>
                <ConditionalDisplay condition={isSelected(ebBus) && isSelected(ebSource) && isSelected(detailType)}>
                    <Box id="eventBridge-buttons" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            color="primary"
                            startIcon={<ArrowUpwardIcon />}
                            onClick={previousStep}
                        >
                            BACK
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<FileUploadIcon />}
                        >
                            REQUEST DEPLOYMENT
                        </Button>
                    </Box>
                </ConditionalDisplay>
            </StepContent>
        </>
    )
}