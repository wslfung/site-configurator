'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { Container, Box, Typography, IconButton, useTheme, FormControl, InputLabel, Select, MenuItem, TextField, Autocomplete, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useForm, Controller } from 'react-hook-form';
import { LambdaFormData } from '@/types/lambdaForm';
import { useElectronRouter } from '@/hooks/useElectronRouter';
import { regions } from '@/utils/regions';
import { useAWSCredentials } from '@/hooks/useAWSCredentials';
import { useEffect } from 'react';
import { isSelected } from '@/utils/tools';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/reduxStore';
import {
    setRegion, setDomain, setRepository, setPackage, setVersion, setTargetRegion, setCredentials, setLambdaFunctionName,
    fetchDomains, fetchRepositories, fetchPackages, fetchVersions, fetchLambdaFunctions, deployLambda
} from '@/store/lambdaDeploySlice';

let imagePath = "./aws-lambda.svg";
if (process.env.NODE_ENV === 'development') {
    imagePath = "./aws-lambda.svg";
}

interface LambdaDeployFormData extends LambdaFormData {
    domain: string;
    repository: string;
    package: string;
    version: string;
    targetRegion: string;
    lambdaFunctionName: string;
}

export default function LambdaPage() {
    const { credentials, isLoading, error } = useAWSCredentials();
    const electronRouter = useElectronRouter();
    const dispatch = useDispatch<AppDispatch>();
    const {
        region, domain, repository, package: codePackage, version, targetRegion, lambdaFunctionName,
        domains, repositories, packages, versions, lambdaFunctions, deployResult, loading, error: lambdaError
    } = useSelector((state: RootState) => state.lambdaDeploy);
    const { control, getValues, setValue, resetField, watch, handleSubmit, formState: { errors }, reset } = useForm<LambdaDeployFormData>({
        defaultValues: {
            region: 'none',
            domain: 'none',
            repository: 'none',
            package: '',
            version: '',
            targetRegion: 'none',
            lambdaFunctionName: ''
        }
    });

    const theme = useTheme();
    usePageTitle('AWS Lambda Deployment');

    const handleLambdaDeployment = () => {
        if (!credentials) {
            window.electronAPI?.openMessageDialog('Unable to deploy, no credentials available', 'Error', ['OK'], 'error');
            return;
        }
        // Find the package object to get namespace/format if available
        const pack = packages.find(pkg => pkg.name === codePackage);
        dispatch(deployLambda({
            region,
            credentials,
            domain,
            repository,
            packageName: codePackage,
            namespace: pack?.namespace || '',
            format: pack?.format || 'generic',
            version,
            targetRegion,
            lambdaFunctionName
        }));
    }

    useEffect(() => {
        if (deployResult) {
            window.electronAPI?.openMessageDialog('Lambda deployment requested successfully', 'Success', ['OK'], 'info');
        }
    }, [deployResult]);

    // Sync credentials from hook to Redux
    useEffect(() => {
        if (!isLoading) {
            dispatch(setCredentials(credentials || null));
        }
    }, [credentials, isLoading, dispatch]);

    // Fetch domains when region or credentials change
    useEffect(() => {
        if (!isLoading && credentials && region && region !== 'none') {
            dispatch(fetchDomains({ region, credentials }));
        }
    }, [region, credentials, isLoading, dispatch]);

    useEffect(() => {
        if (domains.length === 1) {
            handleDomainChange(domains[0]);
        }
    }, [domains, dispatch]);

    // Fetch repositories when domain changes
    useEffect(() => {
        if (!isLoading && credentials && region && domain && domain !== 'none') {
            dispatch(fetchRepositories({ region, credentials, domain }));
        }
    }, [region, domain, credentials, isLoading, dispatch]);

    useEffect(() => {
        if (repositories.length === 1) {
            handleRepositoryChange(repositories[0]);
        }
    }, [repositories, dispatch]);

    // Fetch packages when repository changes
    useEffect(() => {
        if (!isLoading && credentials && region && domain && repository && repository !== 'none') {
            dispatch(fetchPackages({ region, credentials, domain, repository }));
        }
    }, [region, domain, repository, credentials, isLoading, dispatch]);

    useEffect(() => {
        if (packages.length === 1) {
            handlePackageChange(packages[0].name);
        }
    }, [packages, dispatch])
    // Fetch versions when package changes
    useEffect(() => {
        if (!isLoading && credentials && region && domain && repository && codePackage) {
            const pack = packages.find(pkg => pkg.name === codePackage);
            if (pack) {
                dispatch(fetchVersions({ region, credentials, domain, repository, packageName: pack.name, namespace: pack.namespace || '', format: 'generic' }));
            }
        }
    }, [region, domain, repository, codePackage, credentials, isLoading, packages, dispatch]);

    useEffect(() => {
        if (!isLoading && credentials && targetRegion !== 'none') {
            dispatch(fetchLambdaFunctions({ region: targetRegion, credentials }));
        }
    }, [targetRegion, credentials, isLoading, dispatch])
    useEffect(() => {
        if (versions.length === 1) {
            handleVersionChange(versions[0]);
        }
    }, [versions, dispatch]);

    // Handlers for dropdown changes
    const handleRegionChange = (value: string) => {
        dispatch(setRegion(value));
        setValue('region', value);
        resetField('domain');
        resetField('repository');
        resetField('package');
        resetField('version');
    };
    const handleDomainChange = (value: string) => {
        dispatch(setDomain(value));
        setValue('domain', value);
        resetField('repository');
        resetField('package');
        resetField('version');
    };
    const handleRepositoryChange = (value: string) => {
        dispatch(setRepository(value));
        setValue('repository', value);
        resetField('package');
        resetField('version');
    };
    const handlePackageChange = (value: string | null) => {
        const safeValue = value ?? '';
        dispatch(setPackage(safeValue));
        setValue('package', safeValue);
        resetField('version');
    };
    const handleVersionChange = (value: string | null) => {
        const safeValue = value ?? '';
        dispatch(setVersion(safeValue));
        setValue('version', safeValue);
    };
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
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box className="img-background" sx={{ backgroundImage: `url("./aws-lambda.svg")` }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
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
                    <Box id="region-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 4 }}>
                        <FormControl fullWidth>
                            <InputLabel>Region</InputLabel>
                            <Controller
                                name="region"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label="Region"
                                        sx={{ width: '100%' }}
                                        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                        value={region}
                                        onChange={e => handleRegionChange(e.target.value)}
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
                    {(isSelected(region) && domains.length > 0) && (
                        <Box id="domain-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <FormControl fullWidth >
                                <InputLabel>Domain</InputLabel>
                                <Controller
                                    name="domain"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Domain"
                                            sx={{ width: '100%' }}
                                            MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                            value={domain}
                                            onChange={e => handleDomainChange(e.target.value)}
                                        >
                                            <MenuItem value="none">Please select a domain</MenuItem>
                                            {domains.map((domain) => (
                                                <MenuItem key={domain} value={domain}>
                                                    {domain}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Box>
                    )}
                    {isSelected(domain) && repositories.length > 0 && (
                        <Box id="repository-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Repository</InputLabel>
                                <Controller
                                    name="repository"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Repository"
                                            sx={{ width: '100%' }}
                                            MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                            value={repository}
                                            onChange={e => handleRepositoryChange(e.target.value)}
                                        >
                                            <MenuItem value="none">Please select a repository</MenuItem>
                                            {repositories.map((repository) => (
                                                <MenuItem key={repository} value={repository}>
                                                    {repository}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Box>
                    )}
                    {isSelected(repository) && packages.length > 0 && (
                        <Box id="package-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Controller
                                name="package"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Autocomplete
                                        {...field}
                                        sx={{ mr: 2, flexGrow: 1 }}
                                        options={packages.map(pkg => pkg.name)}
                                        value={codePackage || ''}
                                        onChange={(event, newValue) => handlePackageChange(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Package"
                                                placeholder="Search packages..."
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />)}
                            />
                        </Box>
                    )}
                    {isSelected(codePackage) && versions.length > 0 && (
                        <Box id="version-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Controller
                                name="version"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Autocomplete
                                        {...field}
                                        sx={{ mr: 2, flexGrow: 1 }}
                                        options={versions}
                                        value={version || ''}
                                        onChange={(event, newValue) => handleVersionChange(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Version"
                                                placeholder="Search versions..."
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />)}
                            />
                        </Box>
                    )}
                    {isSelected(version) && (
                        <Box sx={{ display: 'block', mb: 2, mt: 2, width: '100%', textAlign: 'center' }}>
                            <ArrowDownwardIcon sx={{ alignSelf: 'center', mt: 4, mb: 4 }} />
                            <Box id='target-region-selection' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', mb: 2 }}>
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
                            {isSelected(targetRegion) && lambdaFunctions.length > 0 && (
                                <Box id="lambda-function-name-selection" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Controller
                                        name="lambdaFunctionName"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Autocomplete
                                                {...field}
                                                sx={{ mr: 2, flexGrow: 1 }}
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
                            )}
                        </Box>
                    )}
                    {isSelected(lambdaFunctionName) && (
                        <Box sx={{ float: 'right' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<FileUploadIcon />}
                            >
                                REQUEST DEPLOYMENT
                            </Button>
                        </Box>
                    )}
                </form>
            </Container>
        </>
    )
}
