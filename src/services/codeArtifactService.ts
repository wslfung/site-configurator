import { CodeartifactClient, ListPackagesCommand, ListPackagesCommandOutput, ListPackageVersionsCommand, PackageFormat } from '@aws-sdk/client-codeartifact';

export interface Package {
    name: string;
    namespace?: string;
    format: string;
}

export class CodeArtifactService {
    private codeartifactClient: CodeartifactClient;

    constructor(region: string) {
        this.codeartifactClient = new CodeartifactClient({ region });
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

    async listCodeArtifactPackageVersions(domain: string, repository: string, packageName: string, format: PackageFormat): Promise<string[]> {
        try {
            const command = new ListPackageVersionsCommand({
                domain,
                repository,
                package: packageName,
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
