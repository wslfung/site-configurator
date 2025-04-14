import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { Theme } from '@mui/material';
import {useSelector} from 'react-redux';
import { RootState } from '@/store/reduxStore';


export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const themeMode = useSelector((state: RootState) => state.themePreferenceForm.theme);
    const theme = createTheme({
        palette: {
          mode: themeMode,
        },
    });  
    
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {children}
            </CssBaseline>
        </ThemeProvider>
    );
}