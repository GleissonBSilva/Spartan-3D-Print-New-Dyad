import { describe, it, expect } from 'vitest';
import { generatePixPayload, calculateCRC16 } from './pixService';

describe('pixService', () => {
  it('calculates valid CRC16 for standard string', () => {
    // CRC16 de "123456789" no modelo CCITT 0x1021 padrão é 29B1
    const crc = calculateCRC16('123456789');
    expect(crc).toBe('29B1');
  });

  it('generates valid Pix payload with mandatory EMV tags', () => {
    const payload = generatePixPayload({
      chave: '12345678000199',
      nomeTitular: 'Spartan 3D',
      cidade: 'Sao Paulo',
      valor: 150.0,
      txId: 'SPARTAN123',
    });

    expect(payload).toContain('000201'); // Payload Format Indicator
    expect(payload).toContain('br.gov.bcb.pix'); // GUI Pix
    expect(payload).toContain('12345678000199'); // Chave
    expect(payload).toContain('5303986'); // Moeda Real
    expect(payload).toContain('5406150.00'); // Valor
    expect(payload).toContain('5802BR'); // País
    expect(payload).toContain('6304'); // Header do CRC16
    expect(payload.length).toBeGreaterThan(60);
  });
});
