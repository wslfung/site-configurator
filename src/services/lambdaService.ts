import { AWSCredentials } from '@/types/awsCredentials';
import { LambdaClient, ListFunctionsCommand, ListTagsCommand, FunctionConfiguration } from '@aws-sdk/client-lambda';

export interface Package {
    name: string;
    namespace?: string;
    format: string;
}

export class LambdaService {

    private lambdaClient: LambdaClient;

    constructor(region: string, credentials: AWSCredentials | null) {
        this.lambdaClient = new LambdaClient({ region, credentials: credentials ? {
            accessKeyId: credentials.keyId,
            secretAccessKey: credentials.secretKey
        } : undefined });
    }

    /**
     * Retrieves the tags associated with a Lambda function by ARN.
     * @param functionArn The ARN of the Lambda function.
     * @returns A key-value object of tags.
     */
    async getFunctionTags(functionArn: string): Promise<Record<string, string>> {
        try {
            const command = new ListTagsCommand({ Resource: functionArn });
            const response = await this.lambdaClient.send(command);
            return response.Tags || {};
        } catch (error) {
            console.error('Error retrieving Lambda function tags:', error);
            throw error;
        }
    }

    async listLambdaFunctions(): Promise<FunctionConfiguration[]> {
        try {
            const command = new ListFunctionsCommand({});
            const response = await this.lambdaClient.send(command);
            return response.Functions || [];
        } catch (error) {
            console.error('Error listing Lambda functions:', error);
            throw error;
        }
    }

}