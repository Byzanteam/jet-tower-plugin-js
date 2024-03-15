import { JetTowerOAuthClient } from "./types.ts";

const oauthApiEndpointQuery = `
query OAuthAPIEndpointQuery {
  oauthApiEndpoint
}
`;

interface OAuthAPIEndpointQueryResponse {
  oauthApiEndpoint: string;
}

const oauthClientQuery = `
query {
  oauthClient {
    clientId
    clientSecret
  }
}
`;

interface OAuthClientQueryResponse {
  oauthClient: JetTowerOAuthClient;
}

type UserInfoScalarValue = boolean | number | string;
type UserInfoValue = UserInfoScalarValue | UserInfoScalarValue[];

interface UserInfoResponse {
  [index: string]: UserInfoValue;
  id: string;
  name: string;
  phone: string;
  inserted_at: string;
  updated_at: string;
}

export { oauthApiEndpointQuery, oauthClientQuery };
export type {
  OAuthAPIEndpointQueryResponse,
  OAuthClientQueryResponse,
  UserInfoResponse,
};
