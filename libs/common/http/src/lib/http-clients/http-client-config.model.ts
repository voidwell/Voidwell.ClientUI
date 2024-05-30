export interface HttpClientConfig {
  url: string;
  headers?: Record<string, string>;
}

export interface HttpClients {
  [clientName: string]: HttpClientConfig;
}