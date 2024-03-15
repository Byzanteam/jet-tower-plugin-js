interface JetTowerOptions {
  instanceName: string;
}

interface JetTowerOAuthClient {
  clientId: string;
  clientSecret: string;
}

interface UserInfo {
  sub: string;
  name: string;
  phoneNumber: string;
  // The updatedAt is a number representing the number of seconds from 1970-01-01T00:00:00Z as measured in UTC until the date/time.
  updatedAt: number;
  data: Record<string, unknown>;
}

export type { JetTowerOAuthClient, JetTowerOptions, UserInfo };
