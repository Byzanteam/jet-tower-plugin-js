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

export { oauthApiEndpointQuery, oauthClientQuery };
export type { OAuthAPIEndpointQueryResponse, OAuthClientQueryResponse };
