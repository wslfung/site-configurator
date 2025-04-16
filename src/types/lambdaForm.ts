
export interface LambdaDeployFormData {
  region: string;
  name: string;
  domain: string;
  repository: string;
  packageName: string;
  version: string;
  targetRegion: string;
  lambdaFunctionName: string;
  ebBus: string;
  ebSource: string;
  detailType: string;
}
