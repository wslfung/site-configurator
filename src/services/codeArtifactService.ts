import { CodeartifactClient, ListPackagesCommand, ListPackagesCommandOutput, ListPackageVersionsCommand, PackageFormat, ListDomainsCommand, ListRepositoriesInDomainCommand } from '@aws-sdk/client-codeartifact';
import { AWSCredentials } from '@/types/awsCredentials';

export interface CodeArtifactPackage {
    name: string;
    namespace?: string;
    format: string;
}

export class CodeArtifactService {
    private codeartifactClient: CodeartifactClient;

    constructor(region: string, credentials?: AWSCredentials) {
        this.codeartifactClient = new CodeartifactClient({ 
            region,
            credentials: credentials ? {
                accessKeyId: credentials.keyId,
                secretAccessKey: credentials.secretKey
            } : undefined
        });
    }

    async listDomains(): Promise<string[]> {
        try {
            const command = new ListDomainsCommand({});
            const response = await this.codeartifactClient.send(command);
            return (response.domains || []).map(domain => domain.name || '');
        } catch (error) {
            console.error('Error listing CodeArtifact domains:', error);
            throw error;
        }
    }

    async listRepositories(domain: string): Promise<string[]> {
        try {
            const command = new ListRepositoriesInDomainCommand({ domain });
            const response = await this.codeartifactClient.send(command);
            return (response.repositories || []).map(repo => repo.name || '');
        } catch (error) {
            console.error('Error listing CodeArtifact repositories:', error);
            throw error;
        }
    }

    async listCodeArtifactPackages(domain: string, repository: string): Promise<CodeArtifactPackage[]> {
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

    async listCodeArtifactPackageVersions(domain: string, repository: string, packageName: string, namespace: string, format: PackageFormat): Promise<string[]> {
        try {
            const command = new ListPackageVersionsCommand({
                domain,
                repository,
                package: packageName,
                namespace,
                format
            });
            const response = await this.codeartifactClient.send(command);
            return (response.versions || []).map(v => v.version || '');
        } catch (error) {
            console.error('Error listing CodeArtifact package versions:', error);
            throw error;
        }
    }
}
