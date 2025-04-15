import { LambdaClient, ListFunctionsCommand, FunctionConfiguration } from '@aws-sdk/client-lambda';

export interface Package {
    name: string;
    namespace?: string;
    format: string;
}

export class LambdaService {

    private lambdaClient: LambdaClient;

    constructor(region: string) {
        this.lambdaClient = new LambdaClient({ region });
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