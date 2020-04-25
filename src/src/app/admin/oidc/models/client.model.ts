export class ClientConfig {
    public clientId: string;
    public clientName: string;
    public enabled: boolean;
    public requireClientSecret: boolean;
    public allowedGrantTypes: string[];
    public requirePkce: boolean;
    public allowPlainTextPkce: boolean;
    public redirectUris: string[];
    public allowedScopes: string[];
    public allowAccessTokensViaBrowser: boolean;
    public postLogoutRedirectUris: string[];
    public backChannelLogoutUri: string;
    public backChannelLogoutSessionRequired: boolean;
    public frontChannelLogoutUri: string;
    public frontChannelLogoutSessionRequired: boolean;
    public enableLocalLogin: boolean;
    public identityProviderRestrictions: string[];
    public identityTokenLifetime: number;
    public accessTokenLifetime: number;
    public authorizationCodeLifetime: number;
    public allowOfflineAccess: boolean;
    public absoluteRefreshTokenLifetime: number;
    public slidingRefreshTokenLifetime: number;
    public refreshTokenUsage: number;
    public refreshTokenExpiration: number;
    public updateAccessTokenClaimsOnRefresh: boolean;
    public accessTokenType: number;
    public includeJwtId: boolean;
    public allowedCorsOrigins: string[];
    public claims: ClientClaim[];
    public alwaysSendClientClaims: boolean;
    public alwaysIncludeUserClaimsInIdToken: boolean;
    public challengeUrl: string;
  
    constructor(client?: any) {
  
      if (client) {
        Object.assign(this, client);
      } else {
        this.enabled = true;
        this.requireClientSecret = true;
        this.backChannelLogoutSessionRequired = true;
        this.enableLocalLogin = true;
        this.accessTokenType = 0;
      }
  
    }
  }
  
  export class ClientClaim {
    constructor(
      public type: string,
      public value: string
    ) { }
  }
  
  