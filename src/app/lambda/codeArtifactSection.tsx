import { Controller, Control, UseFormSetValue, UseFormResetField } from 'react-hook-form';
import { regions } from '@/utils/regions';
import { FormControl, InputLabel, Select, MenuItem, Step, StepLabel, StepContent, Box, Autocomplete, TextField, Button } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/reduxStore';
import { useEffect } from 'react';
import { LambdaDeployFormData } from '@/types/lambdaForm';
import ConditionalDisplay from '@/app/components/ConditionalDisplay';
import { isSelected, P, S } from '@/utils/tools';
import { setRegion, setDomain, setRepository, setPackage, setVersion, fetchDomains, fetchRepositories, fetchPackages, fetchVersions } from '@/store/codeArtifactFormSlice';

export default function CodeArtifactSection({ collapse, control, setValue, resetField, nextStep, previousStep }: { collapse: boolean, control: Control<LambdaDeployFormData, any, LambdaDeployFormData>, setValue: UseFormSetValue<LambdaDeployFormData>, resetField: UseFormResetField<LambdaDeployFormData>, nextStep: () => void, previousStep: () => void }) {
    const dispatch = useDispatch<AppDispatch>();

    const handleRegionChange = (value: string) => {
        dispatch(setRegion(value));
        setValue('region', value);
        resetField('domain');
        resetField('repository');
        resetField('packageName');
        resetField('version');
    };
    const handleDomainChange = (value: string) => {
        dispatch(setDomain(value));
        setValue('domain', value);
        resetField('repository');
        resetField('packageName');
        resetField('version');
    };
    const handleRepositoryChange = (value: string) => {
        dispatch(setRepository(value));
        setValue('repository', value);
        resetField('packageName');
        resetField('version');
    };
    const handlePackageChange = (value: string | null) => {
        const safeValue = value ?? '';
        const pkg = packages.find(p => p.name === safeValue);
        if (pkg) dispatch(setPackage(pkg));
        setValue('packageName', safeValue);
        resetField('version');
    };
    const handleVersionChange = (value: string | null) => {
        const safeValue = value ?? '';
        dispatch(setVersion(safeValue));
        setValue('version', safeValue);
    };

    const {
        region, domain, repository, packageName: codePackage, version, versions, domains, repositories, packages, loading
    } = useSelector((state: RootState) => state.codeArtifactForm);

    useEffect(() => {
        if (!collapse && isSelected(region)) {
            dispatch(fetchDomains({ region }));
        }
    }, [region]);

    // Fetch repositories when domain changes
    useEffect(() => {
        if (!collapse && !loading && isSelected(region) && isSelected(domain)) {
            dispatch(fetchRepositories({ region, domain }));
        }
    }, [domain]);

    // Fetch packages when repository changes
    useEffect(() => {
        if (!collapse && !loading && isSelected(region) && isSelected(domain) && isSelected(repository)) {
            dispatch(fetchPackages({ region, domain, repository }));
        }
    }, [repository]);

    // Fetch versions when package changes
    useEffect(() => {
        if (!collapse && !loading && isSelected(region) && isSelected(domain) && isSelected(repository) && isSelected(codePackage)) {
            const pack = packages.find(pkg => pkg.name === codePackage);
            if (pack) {
                dispatch(fetchVersions({ region, domain, repository, packageName: pack.name, namespace: pack.namespace || '', format: 'generic' }));
            }
        }
    }, [codePackage]);
    // useEffect(() => {
    //     if (domains.length === 1) {
    //         handleDomainChange(domains[0]);
    //     }
    // }, [domains, dispatch]);
    // useEffect(() => {
    //     if (repositories.length === 1) {
    //         handleRepositoryChange(repositories[0]);
    //     }
    // }, [repositories, dispatch]);
    // useEffect(() => {
    //     if (packages.length === 1) {
    //         handlePackageChange(packages[0].name);
    //     }
    // }, [packages, dispatch])
    // useEffect(() => {
    //     if (versions.length === 1) {
    //         handleVersionChange(versions[0]);
    //     }
    // }, [versions, dispatch]);


    return (
        <>
            <StepLabel>
                <ConditionalDisplay condition={!collapse}>
                    Select Artifact
                </ConditionalDisplay>
                <ConditionalDisplay condition={collapse}>
                    <b>Artifact:</b> region: <S>{region}</S>, domain: <S>{domain}</S>, repository: <S>{repository}</S>, package: <S>{codePackage}</S>, version: <S>{version}</S>
                </ConditionalDisplay>
            </StepLabel>
            <StepContent sx={{ width: '80%' }}>
                <Box id="region-selection" sx={{ mb: 2, mt: 4 }}>
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
                <ConditionalDisplay condition={(isSelected(region) && domains.length > 0)}>
                    <Box id="domain-selection" sx={{ mb: 2 }}>
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
                </ConditionalDisplay>
                <ConditionalDisplay condition={isSelected(domain) && repositories.length > 0}>
                    <Box id="repository-selection" sx={{ mb: 2 }}>
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
                </ConditionalDisplay>
                <ConditionalDisplay condition={isSelected(repository) && packages.length > 0}>
                    <Box id="package-selection" sx={{ mb: 2 }}>
                        <Controller
                            name="packageName"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Autocomplete
                                    {...field}
                                    sx={{ width: '100%' }}
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
                </ConditionalDisplay>
                <ConditionalDisplay condition={isSelected(codePackage) && versions.length > 0}>
                    <Box id="version-selection" sx={{ mb: 2 }}>
                        <Controller
                            name="version"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Autocomplete
                                    {...field}
                                    sx={{ width: '100%' }}
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
                </ConditionalDisplay>
                <ConditionalDisplay condition={isSelected(version)}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            type="button"
                            onClick={nextStep}
                            startIcon={<ArrowDownwardIcon />}
                        >
                            Next
                        </Button>
                    </Box>
                </ConditionalDisplay>
            </StepContent>
        </>
    )
}