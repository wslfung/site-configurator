import { CodeartifactClient, ListPackagesCommand, ListPackagesCommandOutput } from '@aws-sdk/client-codeartifact';
import { LambdaClient, ListFunctionsCommand, ListFunctionsCommandOutput, FunctionConfiguration } from '@aws-sdk/client-lambda';
import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';

export interface Package {
    name: string;
    namespace?: string;
    format: string;
}

export class AWSService {
    private codeartifactClient: CodeartifactClient;
    private lambdaClient: LambdaClient;
    private eventBridgeClient: EventBridgeClient;

    constructor(region: string) {
        this.codeartifactClient = new CodeartifactClient({ region });
        this.lambdaClient = new LambdaClient({ region });
        this.eventBridgeClient = new EventBridgeClient({ region });
    }

    async listCodeArtifactPackages(domain: string, repository: string): Promise<Package[]> {
        try {
            const command = new ListPackagesCommand({
                domain,
                repository
            });
            const response = await this.codeartifactClient.send(command);
            return (response.packages || []).map(pkg => ({
                name: pkg.package || '',
                namespace: pkg.namespace,
                format: pkg.format || ''
            }));
        } catch (error) {
            console.error('Error listing CodeArtifact packages:', error);
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

    async putEventToEventBridge(
        eventBusName: string,
        source: string,
        detailType: string,
        detail: Record<string, any>
    ): Promise<string[]> {
        try {
            const entry: PutEventsRequestEntry = {
                EventBusName: eventBusName,
                Source: source,
                DetailType: detailType,
                Detail: JSON.stringify(detail),
                Time: new Date()
            };

            const command = new PutEventsCommand({
                Entries: [entry]
            });

            const response = await this.eventBridgeClient.send(command);
            return (response.Entries || []).map(entry => entry.EventId || '');
        } catch (error) {
            console.error('Error putting event to EventBridge:', error);
            throw error;
        }
    }
}