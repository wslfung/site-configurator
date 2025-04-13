'use client';

import { useTheme } from "@mui/material"
import { usePageTitle } from '@/utils/usePageTitle';
import { Container, Box, Typography } from '@mui/material';
import './lambda.css';

export default function LambdaPage() {
    const theme = useTheme();
    usePageTitle('AWS Lambda Deployment');
    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box className="lambda-background" />
                <Box sx={{ display: 'flex', minHeight: '70vh', opacity: 0.9, zIndex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        AWS Lambda Deployment
                    </Typography>
                </Box>
            </Container>
        </>
    )
}