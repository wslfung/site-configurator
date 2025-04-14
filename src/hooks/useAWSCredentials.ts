import { useState, useEffect } from 'react';
import { AWSCredentials } from '@/types/awsCredentials';

export function useAWSCredentials() {
    const [credentials, setCredentials] = useState<AWSCredentials | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadCredentials = async () => {
            try {
                setIsLoading(true);
                const storedData = await window.electronAPI?.getAWSCredentials();
                
                if (storedData) {
                    // Decrypt the secret key
                    const decryptedString = await window.electronAPI?.decryptString(storedData.secretKey);
                    
                    setCredentials({
                        accountId: storedData.accountId,
                        keyId: storedData.keyId,
                        secretKey: decryptedString || ''
                    });
                } else {
                    setCredentials(null);
                }
            } catch (err) {
                console.error('Error loading AWS credentials:', err);
                setError(err instanceof Error ? err : new Error('Failed to load AWS credentials'));
            } finally {
                setIsLoading(false);
            }
        };

        loadCredentials();
    }, []);

    return { credentials, isLoading, error };
}
