'use client';

import { useTheme } from "@mui/material"
import { usePageTitle } from '@/utils/usePageTitle';
import { Container, Box, Typography } from '@mui/material';
import './ses.css';

export default function SESPage() {
    const theme = useTheme();
    usePageTitle('SES Email Templates');
    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box className="ses-background" />
                <Box sx={{ display: 'flex', minHeight: '70vh', opacity: 0.9, zIndex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        SES Email Templates
                    </Typography>
                </Box>
            </Container>
        </>
    )
}