import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry, ListEventBusesCommand } from '@aws-sdk/client-eventbridge';
import { AWSCredentials } from '@/types/awsCredentials';

export class EventBridgeService {
    private eventBridgeClient: EventBridgeClient;

    constructor(region: string, credentials: AWSCredentials | null) {
        this.eventBridgeClient = new EventBridgeClient({ region, credentials: credentials ? {
            accessKeyId: credentials.keyId,
            secretAccessKey: credentials.secretKey
        } : undefined });
    }

    /**
     * Lists all EventBridge event buses in the configured region.
     * @returns An array of event bus names.
     */
    async listEventBuses(): Promise<string[]> {
        try {
            const command = new ListEventBusesCommand({});
            const response = await this.eventBridgeClient.send(command);
            return (response.EventBuses || []).map(bus => bus.Name || '');
        } catch (error) {
            console.error('Error listing EventBridge event buses:', error);
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
