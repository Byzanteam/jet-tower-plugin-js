import type { AuthorizeUrlOptions, JetTowerOptions } from "./types.ts";
import { authorizeUrlQuery } from "./api.ts";
import type { AuthorizeUrlQueryResponse } from "./api.ts";

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
   * Build authorize URL for OAuth 2 login with Tower
   *
   * @param redirectUri - URL to redirect after login
   * @param options - Extra options for authorize URL
   * @returns authorize URL for OAuth 2 login
   *
   * @example
   *
   * Build an authorize URL without any options
   * ```ts
   * const tower = new JetTower({ instanceName: "towerInstance" });
   * const url = await tower.authorizeUrl("https://example.com/redirect");
   * ```
   *
   * Build an authorize URL with state and scope
   * ```ts
   * const tower = new JetTower({ instanceName: "towerInstance" });
   * const url = await tower.authorizeUrl("https://example.com/redirect", { state: "foo", scope: "bar" });
   * ```
   */
  async authorizeUrl(
    redirectUri: string,
    options?: AuthorizeUrlOptions,
  ): Promise<string> {
    const { state, scope } = options ?? {};

    const { authorizeUrl } = await this.query<AuthorizeUrlQueryResponse>(
      authorizeUrlQuery,
      {
        redirectUri,
        state,
        scope,
      },
    );

    return authorizeUrl;
  }

  private async query<T>(query: string, variables: object): Promise<T> {
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
