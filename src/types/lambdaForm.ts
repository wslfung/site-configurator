
export interface LambdaDeployFormData {
  region: string;
  name: string;
  domain: string;
  repository: string;
  package: string;
  version: string;
  targetRegion: string;
  lambdaFunctionName: string;
}
