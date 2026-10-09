import { OpenIdConfiguration, PassedInitialConfig } from 'angular-auth-oidc-client';

/**
 * OIDC provider settings. The provider must have a public client registered with
 * the authorization code flow (PKCE) and `redirectUrl` / `postLogoutRedirectUri`
 * allowed. Token renewal uses refresh tokens, so `offline_access` must be allowed.
 */
const oidcConfig: OpenIdConfiguration = {
    authority: 'https://auth.voidwell.com',
    clientId: 'voidwell-clientui',
    redirectUrl: location.origin + '/',
    postLogoutRedirectUri: location.origin + '/',
    responseType: 'code',
    scope: 'openid email profile roles offline_access voidwell-daybreakgames voidwell-platform',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30
};

export const authConfig: PassedInitialConfig = { config: oidcConfig };

export const accountManagementUrl = `${oidcConfig.authority}/account`
    + `?referrer=${oidcConfig.clientId}&referrer_uri=${encodeURIComponent(location.origin + '/')}`;
