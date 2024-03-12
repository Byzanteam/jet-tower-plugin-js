const oauthApiEndpointQuery = `
query OAuthAPIEndpointQuery {
  oauthApiEndpoint
}
`;

interface OAuthAPIEndpointQueryResponse {
  oauthApiEndpoint: string;
}

export { oauthApiEndpointQuery };
export type { OAuthAPIEndpointQueryResponse };
