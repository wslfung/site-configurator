import { styled } from '@mui/material/styles';

export const isSelected: (value: string) => boolean = (value: string) => {
    return !!(value && value !== 'none');
}

export async function getAWSCredentials() {
    try {
        const credentials = await window.electronAPI?.getAWSCredentials();
        const decryptedSecret = await window.electronAPI?.decryptString(credentials?.secretKey || '');
        if (!decryptedSecret) {
            throw new Error('Unable to decrypt secret key');
        }
        credentials.secretKey = decryptedSecret;
        return credentials;
    } catch {
        window.electronAPI?.openMessageDialog('Failed to load AWS credentials', 'Error', ['OK'], 'error');
        return null;
    }
}

export const P = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main, // Sets the color to the primary color
}));

export const S = styled('span')(({ theme }) => ({
    color: theme.palette.secondary.main, // Sets the color to the secondary color
}));
