interface JetTowerOptions {
  instanceName: string;
}

interface JetTowerOAuthClient {
  clientId: string;
  clientSecret: string;
}

type UserInfoScalarValue = boolean | number | string;
type UserInfoValue = UserInfoScalarValue | UserInfoScalarValue[];

interface UserInfo {
  sub: string;
  name: string;
  phoneNumber: string;
  updatedAt: number;
  data: Record<string, UserInfoValue>;
}

export type { JetTowerOAuthClient, JetTowerOptions, UserInfo, UserInfoValue };
