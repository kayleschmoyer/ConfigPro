import type { SecretMask } from './types';

export type ServiceAccountDescriptor = {
  clientEmail: string;
  projectId: string;
  privateKeyId: string;
  tokenUri?: string;
};

export function parseServiceAccount(json: string): ServiceAccountDescriptor {
  const parsed = JSON.parse(json);
  if (!parsed.client_email || !parsed.project_id || !parsed.private_key_id) {
    throw new Error('Missing required service account fields');
  }

  return {
    clientEmail: parsed.client_email,
    projectId: parsed.project_id,
    privateKeyId: parsed.private_key_id,
    tokenUri: parsed.token_uri
  };
}

export function maskServiceAccountKey(privateKey: string): SecretMask {
  const prefix = privateKey.slice(0, 8).replace(/[^A-Z0-9]/gi, 'X');
  return { prefix, masked: '••••••••••••••••••••••••••' };
}
