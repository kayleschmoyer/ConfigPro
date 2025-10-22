import { baseTheme , resolveTheme } from '@/app/config/theme';

const encoder = new TextEncoder();

const subtle =
  typeof window !== 'undefined' && window.crypto?.subtle
    ? window.crypto.subtle
    : undefined;

const getRandomValues = (length: number) => {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const buffer = new Uint8Array(length);
    window.crypto.getRandomValues(buffer);
    return buffer;
  }

  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  return buffer;
};

const base64UrlEncode = (input: Uint8Array) =>
  btoa(String.fromCharCode(...input))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export type PkcePair = {
  verifier: string;
  challenge: string;
};

export async function createPkcePair(length = 64): Promise<PkcePair> {
  const randomValues = getRandomValues(length);
  const verifier = base64UrlEncode(randomValues);

  if (!subtle) {
    return { verifier, challenge: verifier };
  }

  const digest = await subtle.digest('SHA-256', encoder.encode(verifier));
  const challenge = base64UrlEncode(new Uint8Array(digest));
  return { verifier, challenge };
}

export type OAuthDescriptor = {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state?: string;
};

export function buildAuthorizationUrl(
  descriptor: OAuthDescriptor,
  pkce: PkcePair,
  extras?: Record<string, string>
) {
  const params = new URLSearchParams({
    response_type: 'code',
    code_challenge_method: 'S256',
    code_challenge: pkce.challenge,
    client_id: descriptor.clientId,
    redirect_uri: descriptor.redirectUri,
    scope: descriptor.scopes.join(' ')
  });

  if (descriptor.state) {
    params.set('state', descriptor.state);
  }

  if (extras) {
    Object.entries(extras).forEach(([key, value]) => {
      if (value != null) {
        params.set(key, value);
      }
    });
  }

  return `${descriptor.authorizationEndpoint}?${params.toString()}`;
}

export function oauthBrandGradient(themeName?: string) {
  const theme = resolveTheme(themeName) ?? baseTheme;
  return `radial-gradient(circle at top, ${theme.primary} 0%, ${theme.accent} 60%, ${theme.surface} 100%)`;
}
