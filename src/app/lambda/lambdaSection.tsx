import { Controller, Control } from 'react-hook-form';
import { LambdaDeployFormData } from '@/types/lambdaForm';
import { UseFormSetValue, UseFormResetField } from 'react-hook-form';
import { regions } from '@/utils/regions';
import { FormControl, InputLabel, Select, MenuItem, Box, Autocomplete, TextField, Button, StepLabel, StepContent } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { isSelected } from '@/utils/tools';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/reduxStore';
import ConditionalDisplay from '@/app/components/ConditionalDisplay';
import { setTargetRegion, setLambdaFunctionName, fetchLambdaFunctions } from '@/store/lambdaFormSlice';

export default function LambdaSection({ collapse, control, setValue, resetField, nextStep, previousStep }: { collapse: boolean, control: Control<LambdaDeployFormData, any, LambdaDeployFormData>, setValue: UseFormSetValue<LambdaDeployFormData>, resetField: UseFormResetField<LambdaDeployFormData>, nextStep: () => void, previousStep: () => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const {
        targetRegion, lambdaFunctionName, lambdaFunctions, loading, error: lambdaError
    } = useSelector((state: RootState) => state.lambdaForm);

    // Fetch domains when region or credentials change

    useEffect(() => {
        if (!collapse && !loading && isSelected(targetRegion) && lambdaFunctions.length === 0) {
            dispatch(fetchLambdaFunctions({ region: targetRegion }));
        }
    }, [targetRegion])

    // Handlers for dropdown changes
    const handleTargetRegionChange = (value: string) => {
        dispatch(setTargetRegion(value));
        setValue('targetRegion', value);
    };
    const handleLambdaFunctionNameChange = (value: string | null | undefined) => {
        const safeValue = value ?? '';
        dispatch(setLambdaFunctionName(safeValue));
        setValue('lambdaFunctionName', safeValue);
    };


    return (
        <>
            <StepLabel>Select Lambda</StepLabel>
            <StepContent>
                <Box id="target-region-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>Target Region</InputLabel>
                        <Controller
                            name="targetRegion"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Target Region"
                                    sx={{ width: '100%' }}
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                    value={targetRegion}
                                    onChange={e => handleTargetRegionChange(e.target.value)}
                                >
                                    <MenuItem value="none">Please select a region</MenuItem>
                                    {regions.map((regionItem) => (
                                        <MenuItem key={regionItem} value={regionItem}>
                                            {regionItem}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                </Box>
                <ConditionalDisplay condition={isSelected(targetRegion) && lambdaFunctions.length > 0}>
                    <Box id="lambda-function-name-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Controller
                            name="lambdaFunctionName"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Autocomplete
                                    {...field}
                                    sx={{ width: '100%' }}
                                    options={lambdaFunctions.map(lambda => lambda.FunctionName)}
                                    value={lambdaFunctionName || ''}
                                    onChange={(event, newValue) => handleLambdaFunctionNameChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Available Lambdas"
                                            placeholder="Search available lambdas..."
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />)}
                        />
                    </Box>
                </ConditionalDisplay>
                <ConditionalDisplay condition={isSelected(lambdaFunctionName)}>
                    <Box id="lambda-function-name-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2}}>
                        <Button
                            type="button"
                            variant="outlined"
                            color="primary"
                            startIcon={<ArrowUpwardIcon />}
                            onClick={previousStep}
                            sx={{ mr: 2 }}
                        >
                            BACK
                        </Button>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            startIcon={<ArrowDownwardIcon />}
                            onClick={nextStep}
                        >
                            NEXT
                        </Button>
                    </Box>
                </ConditionalDisplay>
            </StepContent>
        </>
    )
}