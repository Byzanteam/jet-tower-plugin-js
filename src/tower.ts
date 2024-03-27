import type {
  JetTowerOAuthClient,
  JetTowerOptions,
  TokenIntrospection,
  UserInfo,
} from "./types.ts";
import { oauthApiEndpointQuery, oauthClientQuery } from "./api.ts";
import type {
  IntrospectTokenResponse,
  OAuthAPIEndpointQueryResponse,
  OAuthClientQueryResponse,
  UserInfoResponse,
} from "./api.ts";
import { url as urlUtils } from "../deps.ts";

export class JetTower {
  private pluginInstance: BreezeRuntime.Plugin;

  private oauthClient?: JetTowerOAuthClient;
  private oauthApiEndpoint?: URL;

  constructor(options: JetTowerOptions) {
    const pluginInstance = BreezeRuntime.plugins[options.instanceName];

    if (!pluginInstance) {
      throw new Error(`Plugin ${options.instanceName} not found`);
    }

    this.pluginInstance = pluginInstance;
  }

  /**
   * Retrieve OAuth 2 client id and secret
   *
   * @returns OAuth 2 client id and secret
   *
   * @example
   *
   * ```ts
   * const tower = new JetTower({ instanceName: "towerInstance" });
   * const { clientId, clientSecret } = await tower.getOauthClient();
   * ```
   */
  async getOauthClient(): Promise<Readonly<JetTowerOAuthClient>> {
    if (this.oauthClient) {
      return this.oauthClient;
    } else {
      const { oauthClient } = await this.query<OAuthClientQueryResponse>(
        oauthClientQuery,
      );

      this.oauthClient = oauthClient;

      return this.oauthClient;
    }
  }

  /**
   * Build authorize URL for OAuth 2 login with Tower
   *
   * @returns authorize URL for OAuth 2 login
   *
   * @example
   *
   * ```ts
   * const tower = new JetTower({ instanceName: "towerInstance" });
   * const url = await tower.authorizeUrl();
   * ```
   */
  authorizeUrl(): Promise<URL> {
    return this.getOAuthApiEndpoint("/authorize");
  }

  /**
   * Build token URL for OAuth 2 login with Tower
   *
   * @returns token URL for OAuth 2 login
   *
   * @example
   *
   * ```ts
   * const tower = new JetTower({ instanceName: "towerInstance" });
   * const url = await tower.tokenUrl();
   * ```
   */
  tokenUrl(): Promise<URL> {
    return this.getOAuthApiEndpoint("/token");
  }

  /**
   * Get info of current user
   *
   * @param accessToken - OAuth 2 access token
   * @returns user info
   *
   * @example
   *
   * ```ts
   * const tower = new JetTower({ instanceName: "towerInstance" });
   * const { name, phone, ...extraInfo } = await tower.getUserInfo(accessToken);
   * ```
   */
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const url = await this.getOAuthApiEndpoint("/user");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const resp: UserInfoResponse = await response.json();
      const { id, name, phone, updated_at, ...extraInfo } = resp;

      const updatedAt = new Date(updated_at);

      return {
        sub: id,
        name,
        phoneNumber: phone,
        updatedAt: Math.floor(updatedAt.getTime() / 1000),
        data: extraInfo,
      };
    } else {
      const errorBody = await response.text();
      throw new Error("Failed to get user info", { cause: errorBody });
    }
  }

  /**
   * Introspect an access token
   *
   * @param accessToken - OAuth 2 access token
   * @returns token introspection
   *
   * @example
   *
   * ```ts
   * const tower = new JetTower({ instanceName: "towerInstance" });
   * const { active, scope, exp } = await tower.introspectToken(accessToken);
   * ```
   */
  async introspectToken(
    accessToken: string,
  ): Promise<TokenIntrospection> {
    const { clientId, clientSecret } = await this.getOauthClient();

    const url = await this.getOAuthApiEndpoint("/introspect");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        token: accessToken,
      }),
    });

    if (response.ok) {
      const resp: IntrospectTokenResponse = await response.json();
      const { active, sub, scope, exp, iat } = resp;
      return { active, sub, scope, exp, iat };
    } else {
      const errorBody = await response.text();
      throw new Error("Failed to introspect token", { cause: errorBody });
    }
  }

  private async getOAuthApiEndpoint(path?: string): Promise<URL> {
    if (this.oauthApiEndpoint) {
      return this.oauthApiUrl(path);
    } else {
      const { oauthApiEndpoint } = await this.query<
        OAuthAPIEndpointQueryResponse
      >(oauthApiEndpointQuery);

      this.oauthApiEndpoint = new URL(oauthApiEndpoint);

      return this.oauthApiUrl(path);
    }
  }

  private oauthApiUrl(path?: string): URL {
    if (!this.oauthApiEndpoint) {
      throw new Error("OAuth API endpoint is absent");
    }

    if (path) {
      const url = new URL(this.oauthApiEndpoint);
      url.pathname = urlUtils.joinPath(url.pathname, path);
      return url;
    } else {
      return this.oauthApiEndpoint;
    }
  }

  private async query<T>(query: string, variables?: object): Promise<T> {
    const endpoint = await this.pluginInstance.getEndpoint();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.ok) {
      return this.resolveResponse<T>(await response.json());
    } else {
      const errorBody = await response.text();
      throw new Error("Request failed", { cause: errorBody });
    }
  }

  private resolveResponse<T>(
    body: { errors?: ReadonlyArray<{ message: string }>; data?: T },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (body.errors) {
        reject(
          new Error(`GraphQL response error: ${JSON.stringify(body.errors)}`),
        );
      } else if (body.data) {
        resolve(body.data);
      }
    });
  }
}
