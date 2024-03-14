import type { JetTowerOAuthClient, JetTowerOptions } from "./types.ts";
import { oauthApiEndpointQuery, oauthClientQuery } from "./api.ts";
import type {
  OAuthAPIEndpointQueryResponse,
  OAuthClientQueryResponse,
} from "./api.ts";
import { url as urlUtils } from "../deps.ts";

export class JetTower {
  private pluginInstance: BreezeRuntime.Plugin;

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
   * const { clientId, clientSecret } = await tower.oauthClient();
   * ```
   */
  async oauthClient(): Promise<JetTowerOAuthClient> {
    const { oauthClient } = await this.query<OAuthClientQueryResponse>(
      oauthClientQuery,
    );

    return oauthClient;
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
  async authorizeUrl(): Promise<URL> {
    const url = await this.oauthApiEndpoint();
    url.pathname = urlUtils.joinPath(url.pathname, "/authorize");
    return url;
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
  async tokenUrl(): Promise<URL> {
    const url = await this.oauthApiEndpoint();
    url.pathname = urlUtils.joinPath(url.pathname, "/token");
    return url;
  }

  private async oauthApiEndpoint(): Promise<URL> {
    const { oauthApiEndpoint } = await this.query<
      OAuthAPIEndpointQueryResponse
    >(oauthApiEndpointQuery);

    return new URL(oauthApiEndpoint);
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
      const errorBody = await response.json();
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
