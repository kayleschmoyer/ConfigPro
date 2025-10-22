import type { WebhookEndpoint } from './types';

const encoder = new TextEncoder();

async function subtleHmac(message: string, secret: string) {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const key = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      {
        name: 'HMAC',
        hash: { name: 'SHA-256' }
      },
      false,
      ['sign']
    );
    const signature = await window.crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(signature))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  let hash = 0;
  for (let i = 0; i < message.length; i += 1) {
    hash = (hash + message.charCodeAt(i) * 17) % 2 ** 24;
  }
  return hash.toString(16);
}

type SignatureResult = {
  signature: string;
  headers: Record<string, string>;
};

export async function buildSignature(
  payload: string,
  secret: string,
  timestamp: number
): Promise<SignatureResult> {
  const signature = await subtleHmac(`${timestamp}.${payload}`, secret);
  return {
    signature,
    headers: {
      'x-configpro-signature': signature,
      'x-configpro-timestamp': String(timestamp)
    }
  };
}

export async function verifySignature(
  payload: string,
  secret: string,
  headers: Record<string, string>
) {
  const timestamp = Number(headers['x-configpro-timestamp']);
  if (!Number.isFinite(timestamp)) {
    return { valid: false, reason: 'Missing timestamp header' };
  }

  const expected = await buildSignature(payload, secret, timestamp);
  const provided = headers['x-configpro-signature'];
  return {
    valid: Boolean(provided) && timingSafeEquals(expected.signature, provided ?? ''),
    reason: provided ? undefined : 'Missing signature header'
  };
}

function timingSafeEquals(a: string, b: string) {
  const bufferA = encoder.encode(a);
  const bufferB = encoder.encode(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < bufferA.length; i += 1) {
    result |= bufferA[i]! ^ bufferB[i]!;
  }
  return result === 0;
}

export const webhookTemplates: Array<Pick<WebhookEndpoint, 'id' | 'description' | 'url'>> = [
  {
    id: 'billing.invoice.created',
    description: 'Invoice created event',
    url: 'https://example.com/webhooks/invoices'
  },
  {
    id: 'messaging.thread.updated',
    description: 'Messaging thread update',
    url: 'https://example.com/webhooks/messages'
  }
];

export function buildSamplePayload(kind: string) {
  switch (kind) {
    case 'billing.invoice.created':
      return {
        type: kind,
        data: {
          id: 'inv_123',
          amount_due: 4200,
          currency: 'USD',
          customer: 'cus_42'
        }
      };
    case 'messaging.thread.updated':
      return {
        type: kind,
        data: {
          id: 'msg_234',
          status: 'DELIVERED',
          channel: 'TWILIO'
        }
      };
    default:
      return { type: kind, data: {} };
  }
}
