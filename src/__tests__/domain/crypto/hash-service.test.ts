import { HashCodeBuilder } from '../../../domain/crypto/services/hash-service';

describe('HashCodeBuilder', () => {
  let builder: HashCodeBuilder;

  beforeAll(() => {
    if (typeof TextEncoder === 'undefined') {
      const { TextEncoder } = require('util');
      global.TextEncoder = TextEncoder;
    }
    if (typeof crypto === 'undefined') {
      // In Node < 19, need to pull from 'crypto'
      const { webcrypto } = require('crypto');
      (globalThis as any).crypto = webcrypto;
    }
  });

  beforeEach(() => {
    builder = new HashCodeBuilder();
  });

  it('should build a valid hash', async () => {
    const result = await builder
      .setUniqueCode('123')
      .setChannel('WEB')
      .setTerminalId('TERM1')
      .setTransactionId('TX1')
      .setTransactionAmount('100')
      .build();

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should handle missing non-required fields defaults', async () => {
    // We must call the setters to trigger the default logic (value || "0")
    const result = await builder
      .setUniqueCode('')
      .setTerminalId('')
      .setTransactionId('')
      .setChannel('WEB')
      .setTransactionAmount('100')
      .build();
    expect(result).toBeDefined();
  });

  it('should throw if channel missing', async () => {
    await expect(builder
      .setUniqueCode('1')
      .setTerminalId('1')
      .setTransactionId('1')
      .setTransactionAmount('100')
      .build()
    ).rejects.toThrow('All fields are required');
  });

  it('should throw if setChannel called with empty', () => {
    expect(() => builder.setChannel('')).toThrow('Channel is required');
  });

  it('should handle setTimestamp', async () => {
    builder.setTimestamp(1234567890);
    builder.setTimestamp(); // fallback to now
    const res = await builder
      .setUniqueCode('1')
      .setTerminalId('1')
      .setTransactionId('1')
      .setChannel('A')
      .setTransactionAmount(1).build();
    expect(res).toBeDefined();
  });

  it('should use window.crypto if available', async () => {
    const originalWindow = (globalThis as any).window;
    const originalCrypto = (globalThis as any).crypto;

    // Mock window.crypto
    (globalThis as any).window = {
      crypto: {
        subtle: {
          digest: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer)
        }
      }
    };
    // Remove global crypto to force window check
    delete (globalThis as any).crypto;

    const b = new HashCodeBuilder();
    await b
      .setUniqueCode('1')
      .setTerminalId('1')
      .setTransactionId('1')
      .setChannel('A')
      .setTransactionAmount('1').build();

    // Restore
    if (originalWindow) (globalThis as any).window = originalWindow;
    else delete (globalThis as any).window;

    (globalThis as any).crypto = originalCrypto;
  });

  it('should fall back to global crypto', async () => {
    const originalWindow = (globalThis as any).window;
    // Remove window
    delete (globalThis as any).window;

    // Ensure global crypto exists (it does in jest-environment-jsdom or node with webcrypto)
    if (!(globalThis as any).crypto) {
      (globalThis as any).crypto = { subtle: { digest: jest.fn().mockResolvedValue(new Uint8Array([1]).buffer) } };
    }

    const b = new HashCodeBuilder();
    const res = await b
      .setUniqueCode('1')
      .setTerminalId('1')
      .setTransactionId('1')
      .setChannel('A')
      .setTransactionAmount('1').build();
    expect(res).toBeDefined();

    if (originalWindow) (globalThis as any).window = originalWindow;
  });

  it('should throw if no crypto available', async () => {
    const originalWindow = (globalThis as any).window;
    const originalCrypto = (globalThis as any).crypto;

    delete (globalThis as any).window;
    delete (globalThis as any).crypto;

    const b = new HashCodeBuilder();
    await expect(b
      .setUniqueCode('1')
      .setTerminalId('1')
      .setTransactionId('1')
      .setChannel('A')
      .setTransactionAmount('1').build())
      .rejects.toThrow('Web Crypto API is not available');

    (globalThis as any).window = originalWindow;
    (globalThis as any).crypto = originalCrypto;
  });

  it('should use btoa if available', async () => {
    // Node usually has btoa global now, but let's ensure
    const res = await builder
      .setUniqueCode('1')
      .setTerminalId('1')
      .setTransactionId('1')
      .setChannel('A')
      .setTransactionAmount('1').build();
    expect(res).toBeDefined();
  });

  it('should fallback to buffer if btoa missing', async () => {
    const originalBtoa = (globalThis as any).btoa;
    delete (globalThis as any).btoa;

    const res = await builder
      .setUniqueCode('1')
      .setTerminalId('1')
      .setTransactionId('1')
      .setChannel('A')
      .setTransactionAmount('1').build();
    expect(res).toBeDefined();

    if (originalBtoa) (globalThis as any).btoa = originalBtoa;
  });

  it('should set algorithm identifier', async () => {
    builder.setAlgorithmIdentifier('SHA-256');
    const res = await builder
      .setUniqueCode('1')
      .setTerminalId('1')
      .setTransactionId('1')
      .setChannel('A')
      .setTransactionAmount('1').build();
    expect(res).toBeDefined();
  });
});
