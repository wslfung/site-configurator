import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Theme, PaletteMode } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/reduxStore';
import { setFormData } from '@/store/themePreferenceFormSlice';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const themeMode = useSelector((state: RootState) => state.themePreferenceForm.theme);
    
    // Create theme based on current mode
    const theme = useMemo(() => createTheme({
        palette: {
            mode: themeMode as PaletteMode,
        },
    }), [themeMode]);

    // Load theme preference on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await window.electronAPI?.getThemePreference() || 'light';
                dispatch(setFormData({ theme: savedTheme }));
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            }
        };
        loadTheme();
    }, [dispatch]);
    
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {children}
            </CssBaseline>
        </ThemeProvider>
    );
}