export interface DeploymentTest {
  Id: number;
  Title: string;
  Environment: string;
  Status: 'SUCCESS' | 'FAILED' | 'WARNING';
  ResponseTimeMs: number;
  DbVersion?: string;
  Notes?: string;
  TestedBy: string;
  CreatedAt: string;
}

export interface DbConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
}

export interface DbStatusResponse {
  connected: boolean;
  latencyMs: number;
  serverVersion?: string;
  databaseName?: string;
  error?: string;
  config?: DbConfig;
  checkedAt: string;
}

export interface SystemInfo {
  platform: string;
  release: string;
  nodeVersion: string;
  memoryRssMb: number;
  environment: string;
}

export interface CloudDetection {
  isDocker: boolean;
  isAzure: boolean;
  isAws: boolean;
  isRender: boolean;
  isRailway: boolean;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  uptimeSeconds: number;
  system: SystemInfo;
  cloud: CloudDetection;
}

export interface StatsSummary {
  TotalTests: number;
  SuccessCount: number;
  FailedCount: number;
  WarningCount: number;
  AvgLatencyMs: number;
}

export interface EnvironmentStat {
  Environment: string;
  Count: number;
}

export interface StatsResponse {
  success: boolean;
  summary: StatsSummary;
  byEnvironment: EnvironmentStat[];
}

export interface SystemLog {
  Id: number;
  EventType: string;
  Message: string;
  Details?: string;
  CreatedAt: string;
}
