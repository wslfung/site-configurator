import TabPanel, { TabPanelProps } from './tabPanel';
import { Typography, ToggleButtonGroup, ToggleButton, FormControl, FormLabel } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setFormData } from '@/store/themePreferenceFormSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/reduxStore';
import { useEffect } from 'react';

export default function AppearancePanel(props: TabPanelProps) {
    const dispatch = useDispatch();
    const { children, value, index, ...other } = props;
    let theme = useSelector((state: RootState) => state.themePreferenceForm.theme);

    const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: 'light' | 'dark') => {
        console.log('Theme preference changed to:', newValue);
        window.electronAPI?.setThemePreference(newValue);
        dispatch(setFormData({ theme: newValue }));
    };

    const loadTheme = async () => {
        theme = await window.electronAPI?.getThemePreference() || 'light';
    };

    useEffect(() => {
        loadTheme();
    }, []);


    return (
        <TabPanel value={value} index={1} {...other}>
            <Typography variant="h6" gutterBottom>
                Appearance Settings
            </Typography>
            <FormControl component="fieldset" sx={{ mt: 3 }}>
                <FormLabel component="legend">Theme: </FormLabel>

                <ToggleButtonGroup
                    color="primary"
                    value={theme}
                    exclusive
                    onChange={handleChange}
                    aria-label="Theme"
                >
                    <ToggleButton value="light">Light</ToggleButton>
                    <ToggleButton value="dark">Dark</ToggleButton>
                </ToggleButtonGroup>
            </FormControl>
        </TabPanel>
    );
}