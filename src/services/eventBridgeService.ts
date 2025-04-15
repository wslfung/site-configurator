import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import { AWSCredentials } from '@/types/awsCredentials';

export class EventBridgeService {
    private eventBridgeClient: EventBridgeClient;

    constructor(region: string, credentials: AWSCredentials | null) {
        this.eventBridgeClient = new EventBridgeClient({ region, credentials: credentials ? {
            accessKeyId: credentials.keyId,
            secretAccessKey: credentials.secretKey
        } : undefined });
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
