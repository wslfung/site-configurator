
import { Box, Typography, Button, useTheme } from '@mui/material';
import TabPanel, { TabPanelProps } from './tabPanel';
import { AWSCredentials } from '@/types/awsCredentials';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { setFormData } from '@/store/awsCredentialsFormSlice';
import { useEffect } from 'react';

export default function AWSCredentialsTabPanel(props: TabPanelProps) {
    const electronRouter = useElectronRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { children, value, index, ...other } = props;
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AWSCredentials>({
    });

    useEffect(() => {
        const loadStoredData = async () => {
            setIsLoading(true);
            try {
                if (window.electronAPI) {
                    const storedData = await window.electronAPI.getAWSCredentials();
                    if (storedData) {
                        const decryptedString = storedData.secretKey ?
                            await window.electronAPI.decryptString(storedData.secretKey) : '';

                        // dispatch(setFormData({
                        //   ...storedData,
                        //   secretKey: decryptedString || ''
                        // }));

                        reset({
                            ...storedData,
                            secretKey: decryptedString || ''
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading stored data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStoredData();
    }, [reset]);

    return (
        <TabPanel value={value} index={0} {...other}>
            <Typography variant="h6" gutterBottom>
                AWS Credentials
            </Typography>
            {isLoading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Box>
                    {/* Using react-hook-form */}
                    <form onSubmit={handleSubmit(async (data) => {
                        const encryptedSecretKey = await window.electronAPI?.encryptString(data.secretKey);
                        if (encryptedSecretKey && window.electronAPI) {
                            const formData: AWSCredentials = {
                                accountId: data.accountId,
                                keyId: data.keyId,
                                secretKey: encryptedSecretKey,
                            };
                            await window.electronAPI.setAWSCredentials(formData);
                            dispatch(setFormData(formData));
                            electronRouter.navigate('/');
                        }
                    })}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                {...register('accountId', {
                                    required: 'Account ID is required',
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: 'Account ID must be numeric'
                                    }
                                })}
                                label="Account ID"
                                type="number"
                                error={!!errors.accountId}
                                helperText={errors.accountId?.message}
                            />
                            <TextField
                                {...register('keyId', {
                                    required: 'Key ID is required',
                                    pattern: {
                                        value: /^[a-zA-Z0-9]+$/,
                                        message: 'Key ID must be alphanumeric'
                                    }
                                })}
                                label="Key ID"
                                error={!!errors.keyId}
                                helperText={errors.keyId?.message}
                            />
                            <TextField
                                {...register('secretKey', {
                                    required: 'Secret Key is required',
                                    pattern: {
                                        value: /^[a-zA-Z0-9]+$/,
                                        message: 'Secret Key must be alphanumeric'
                                    }
                                })}
                                label="Secret Key"
                                type="password"
                                error={!!errors.secretKey}
                                helperText={errors.secretKey?.message}
                            />
                        </Box>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ float: 'right', marginTop: 20 }}
                        >
                            Save Changes
                        </Button>
                    </form>
                </Box>
            )}
        </TabPanel>
    );
}