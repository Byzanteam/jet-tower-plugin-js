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
  [index: string]: UserInfoValue;
  id: string;
  name: string;
  phone: string;
  inserted_at: string;
  updated_at: string;
}

export type { JetTowerOAuthClient, JetTowerOptions, UserInfo, UserInfoValue };
