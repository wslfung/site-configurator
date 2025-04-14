import { SESClient, CreateTemplateCommand, DeleteTemplateCommand, GetTemplateCommand, ListTemplatesCommand, UpdateTemplateCommand, TemplateMetadata } from '@aws-sdk/client-ses';
import { AWSCredentials } from '@/types/awsCredentials';
import { SESTemplate } from '@/types/sesTemplate';


export class SESTemplateService {
    private sesClient: SESClient;

    constructor(region: string, credentials: AWSCredentials) {
        this.sesClient = new SESClient({
            region,
            credentials: {
                accessKeyId: credentials.keyId,
                secretAccessKey: credentials.secretKey
            }
        });
    }

    async createTemplate(template: SESTemplate): Promise<void> {
        try {
            const command = new CreateTemplateCommand({
                Template: template
            });
            await this.sesClient.send(command);
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    }

    async listTemplates(): Promise<string[]> {
        try {
            const command = new ListTemplatesCommand({});
            const response = await this.sesClient.send(command);
            return (response.TemplatesMetadata || []).map((template: TemplateMetadata) => template.Name || '');
        } catch (error) {
            console.error('Error listing templates:', error);
            throw error;
        }
    }

    async getTemplate(templateName: string): Promise<SESTemplate> {
        try {
            const command = new GetTemplateCommand({
                TemplateName: templateName
            });
            const response = await this.sesClient.send(command);
            return response.Template as SESTemplate;
        } catch (error) {
            console.error('Error getting template:', error);
            throw error;
        }
    }

    async updateTemplate(template: SESTemplate): Promise<void> {
        try {
            const command = new UpdateTemplateCommand({
                Template: template
            });
            await this.sesClient.send(command);
        } catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    }

    async deleteTemplate(templateName: string): Promise<void> {
        try {
            const command = new DeleteTemplateCommand({
                TemplateName: templateName
            });
            await this.sesClient.send(command);
        } catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        }
    }
}