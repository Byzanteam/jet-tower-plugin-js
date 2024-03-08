const authorizeUrlQuery = `
query AuthorizeURL(
  $redirectUri: String!
  $state: String
  $scope: String
) {
  authorizeUrl(redirectUri: $redirectUri, state: $state, scope: $scope)
}
`;

interface AuthorizeUrlQueryResponse {
  authorizeUrl: string;
}

export { authorizeUrlQuery };
export type { AuthorizeUrlQueryResponse };
