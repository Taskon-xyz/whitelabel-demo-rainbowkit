
// PKCS#1 private key in base64 format (matches Go code format)
const TEST_PK_BASE64 = 'MIIEogIBAAKCAQEAs9DTJhLwRolCSMlvQbc37L027g9DvCWdFjtokaj/Y/7iy9nI/EfIFOL8bMXHAJhEmSYLxVW+NXgsXXCpxzaAEhTvaRMiokDsXYhg8PV3OD79eLM17r2zQqk4mOfYipyyTauc5mb3EwCjN9T0VQRjuAbPvfPuWgyeHBDzyDqZNJh/WKXnO6f9/VXR527udSkHNutGIxGE/wIWZhcWBIg3P75MRE6lRKe4rjE9E3r153XLcZ4lPjZj7Q/9rtjQupH4uNErfwSEQoX7b2KfTuCs+75Z/x7VGj5hzhS2eUv6b1S2EO3rT31x0Pxxi62VBEXJgyhorSsND53lBtFBYHSxVwIDAQABAoIBAFTpWiQjElKEs4fSk1aZce+5pCxDig1ZR7Y9ZJJQFxW9wZRYqeez7+ApFeE5fdEillYpmKpdZH40WuLe9lVLv6uKNknMjvDGrrc2VOzERUGKwUAThHbSHsnuRfsylFdUSoCR9vv4CFlxViHhzmUtNveqQ8Rj4ZylU65WNQBK55jlVOj7Vplqv67YzeK5TY5m0oz43b6rwqMMj3lHZxjVrPXmmwhA5OxsvJZq47qrYbE9xMfmoI9/vj+cQ93Iyxnrrwaauulg9ljr8XRrUcoCZ/Up55/CIHmlXhA/xJfTLEnDwt8LAOY8YHHZnFRIGnRdMQ/OgbD0SMXx9UroXMta1sECgYEA6iiQTvfyMUKYYuRIqH27Lg3qemYVJfixqSHN48wut/LvmQ/ngfmpioMBjsjZC55P2FMBlTs+y6T/DmGyaL66y6rqeJkAYBclcjk6qjV5u1jy0sBKhHpfopn7kGy0nHrb+ZUpWlEPVDbIAU3Wtx09Rhh83jkuMV6Igspvgd7AgcECgYEAxJaeaPqtYc7XWi3JTid4XMudwKUjLEXe+rIaVO6Rl4YvpSffDXGZ+fqZtPiCs59ze9Bu1scz+6rkexhJOFwSQ4w+GOeY4Su1r4Mrw9YYQ6tkDw8id7IEJbfmCWs0fn5iG1yUOp+H1x04u/tHVPu+zS/iT2yDnM0oM2NZrEBpSRcCgYBCUDqOIqn0SWfemcf576GS6V3+S+qxVjz6KRil6q1Qavxv3JEzvgDFuVQ3m6ncIHl8SgWovZ6LDa8t430jLOC5zS2Z+bqhe+ye7JYwnfRbmlUqWkrAOefbpMAZpq9/oUuq4xNTAKHWt6zssZ6dPSqdL1ItnQP3902xvKLXpL3gAQKBgG7eArhxpxZh8FGLQNwypk6vBmh+uTdesEHx76e2Y6Vwp64crk6Goq+4BLdq70sdwaMyCVBXR5nG5tQE/kYqpqIxlVO2SSGz5OL2ttfbBhQjtGpJvsaCPpSHAdSOASzVWb7Ul0P4dEN812IsdC4ZS6GsP5VLPW5QxTs17HyYVshBAoGAJt0S2gBc+Z/PhbZXUP6dypf5ik3xnXBsBl6/FnJWAMgdVCSQMOGKsemXNsUFnWIRwi4tO6OeMBmOrPKelaz1KOINPQRPv6Lwuwck1ZMJvnV3noQ884LplZjjTbfkkK4LN8CAPnGvOLPubmm4ZacdFHHb8n+F8L6fyn1Ys5Yoyvc=';

export const signMessage = async (clientId: string, type: 'Email' | 'evm', value: string): Promise<{
  signature: string;
  timestamp: number;
}> => {
  const timestamp = Date.now();
  const message = `${type}|${value}|${clientId}|${timestamp}`;
  console.log('sign source message', message);

  // If running in Node or WebCrypto not available, fallback to Node signer
  if (typeof window === 'undefined' || !(globalThis.crypto && (globalThis.crypto as Crypto).subtle)) {
    return signMessageNode(clientId, type, value);
  }

  // Browser: use WebCrypto SubtleCrypto with RSASSA-PKCS1-v1_5 and SHA-256
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(message);

  // Convert PKCS#1 DER to PKCS#8 DER for WebCrypto import
  const pkcs1Der = base64ToUint8(TEST_PK_BASE64);
  const pkcs8Der = wrapPkcs1ToPkcs8(pkcs1Der);

  const cryptoKey = await (globalThis.crypto as Crypto).subtle.importKey(
    'pkcs8',
    pkcs8Der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await (globalThis.crypto as Crypto).subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    cryptoKey,
    data
  );

  return {
    signature: arrayBufferToBase64(signature),
    timestamp: timestamp
  };
}


/**
 * Sign message with Node.js
 */
export const signMessageNode = (clientId: string, type: 'Email' | 'evm', value: string): {
  signature: string;
  timestamp: number;
} => {
  const timestamp = Date.now();
  const message = `${type}|${value}|${clientId}|${timestamp}`;
    // Use dynamic require to avoid bundling Node 'crypto' into browser builds
    const { sign } = require('crypto') as typeof import('crypto');
    const privateKeyBuffer = Buffer.from(TEST_PK_BASE64, 'base64');
    const signature = sign('RSA-SHA256', new TextEncoder().encode(message), {
      key: privateKeyBuffer,
      format: 'der',
      type: 'pkcs1'
    });
    return {
      signature: signature.toString('base64'),
      timestamp: timestamp
    };
  }

// ---------- Helpers (browser) ----------
function base64ToUint8(base64: string): Uint8Array {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  // Node fallback
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  if (typeof btoa === 'function') {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  // Node fallback
  return Buffer.from(new Uint8Array(buf)).toString('base64');
}

// Wrap PKCS#1 RSAPrivateKey DER into PKCS#8 PrivateKeyInfo DER
function wrapPkcs1ToPkcs8(pkcs1Der: Uint8Array): ArrayBuffer {
  // ASN.1 helpers
  const encodeLength = (len: number): number[] => {
    if (len < 0x80) return [len];
    const bytes: number[] = [];
    let tmp = len;
    while (tmp > 0) {
      bytes.unshift(tmp & 0xff);
      tmp >>= 8;
    }
    return [0x80 | bytes.length, ...bytes];
  };

  const seq = (content: number[]): number[] => [0x30, ...encodeLength(content.length), ...content];
  const objId = (oid: number[]): number[] => [0x06, ...encodeLength(oid.length), ...oid];
  const nullDer = (): number[] => [0x05, 0x00];
  const int0 = (): number[] => [0x02, 0x01, 0x00];
  const octetStr = (bytes: Uint8Array): number[] => [0x04, ...encodeLength(bytes.length), ...Array.from(bytes)];

  // rsaEncryption OID: 1.2.840.113549.1.1.1 -> DER bytes
  const rsaEncryptionOid = [0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01];

  const algorithmIdentifier = seq([...objId(rsaEncryptionOid), ...nullDer()]);
  const privateKey = octetStr(pkcs1Der);

  const privateKeyInfo = seq([
    ...int0(), // version = 0
    ...algorithmIdentifier,
    ...privateKey
  ]);

  return new Uint8Array(privateKeyInfo).buffer;
}