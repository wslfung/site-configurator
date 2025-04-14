import TabPanel, { TabPanelProps } from './tabPanel';
import { Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useTheme } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setFormData } from '@/store/themePreferenceFormSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/reduxStore';


export default function AppearancePanel(props: TabPanelProps) {
    const dispatch = useDispatch();
    const muiTheme = useTheme();
    const { children, value, index, ...other } = props;
    const { theme } = useSelector((state: RootState) => state.themePreferenceForm);
    
    const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: 'light' | 'dark') => {
        console.log('Theme preference changed to:', newValue);
        window.electronAPI?.setThemePreference(newValue);
        dispatch(setFormData({ theme: newValue }));
    };
    
    return (
        <TabPanel value={value} index={1} {...other}>
            <Typography variant="h6" gutterBottom>
                Appearance Settings
            </Typography>
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
        </TabPanel>
    );
}