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
  name: string;
  phone: string;
}

export type { JetTowerOAuthClient, JetTowerOptions, UserInfo, UserInfoValue };
