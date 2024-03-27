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

interface IntrospectTokenResponse {
  active: boolean;
  scope: string;
  exp: number;
  sub: string;
  username?: string;
  iss: string;
  iat: number;
  client_id: string;
}

export { oauthApiEndpointQuery, oauthClientQuery };
export type {
  IntrospectTokenResponse,
  OAuthAPIEndpointQueryResponse,
  OAuthClientQueryResponse,
  UserInfoResponse,
};
