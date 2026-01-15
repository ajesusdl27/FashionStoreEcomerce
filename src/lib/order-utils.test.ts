import { describe, it, expect } from 'vitest';
import { 
  formatOrderId, 
  parseOrderId, 
  isOrderIdFormat, 
  formatInvoiceNumber,
  getDisplayOrderId 
} from './order-utils';

describe('formatOrderId', () => {
  it('should format valid numbers correctly', () => {
    expect(formatOrderId(1)).toBe('#A000001');
    expect(formatOrderId(50)).toBe('#A000050');
    expect(formatOrderId(999)).toBe('#A000999');
    expect(formatOrderId(12345)).toBe('#A012345');
    expect(formatOrderId(999999)).toBe('#A999999');
  });

  it('should handle invalid inputs with #PENDIENTE', () => {
    expect(formatOrderId(0)).toBe('#PENDIENTE');
    expect(formatOrderId(-5)).toBe('#PENDIENTE');
    expect(formatOrderId(-100)).toBe('#PENDIENTE');
    expect(formatOrderId(null)).toBe('#PENDIENTE');
    expect(formatOrderId(undefined)).toBe('#PENDIENTE');
  });

  it('should handle decimal numbers as invalid', () => {
    expect(formatOrderId(1.5)).toBe('#PENDIENTE');
    expect(formatOrderId(3.14)).toBe('#PENDIENTE');
  });

  it('should throw on numbers exceeding limit', () => {
    expect(() => formatOrderId(1000000)).toThrow('exceeds display limit');
    expect(() => formatOrderId(9999999)).toThrow('exceeds display limit');
  });

  it('should handle edge cases at boundaries', () => {
    expect(formatOrderId(1)).toBe('#A000001');
    expect(formatOrderId(999999)).toBe('#A999999');
    expect(() => formatOrderId(1000000)).toThrow();
  });
});

describe('parseOrderId', () => {
  it('should parse formatted IDs correctly', () => {
    expect(parseOrderId('#A000001')).toBe(1);
    expect(parseOrderId('#A000050')).toBe(50);
    expect(parseOrderId('#A012345')).toBe(12345);
    expect(parseOrderId('#A999999')).toBe(999999);
  });

  it('should parse IDs without hash', () => {
    expect(parseOrderId('A000001')).toBe(1);
    expect(parseOrderId('A5')).toBe(5);
    expect(parseOrderId('A999')).toBe(999);
  });

  it('should parse plain numbers', () => {
    expect(parseOrderId('1')).toBe(1);
    expect(parseOrderId('50')).toBe(50);
    expect(parseOrderId('999999')).toBe(999999);
  });

  it('should handle lowercase A', () => {
    expect(parseOrderId('#a000001')).toBe(1);
    expect(parseOrderId('a5')).toBe(5);
  });

  it('should return null for invalid inputs', () => {
    expect(parseOrderId('invalid')).toBe(null);
    expect(parseOrderId('ABC')).toBe(null);
    expect(parseOrderId('')).toBe(null);
    expect(parseOrderId('test@email.com')).toBe(null);
  });

  it('should return null for out of range numbers', () => {
    expect(parseOrderId('0')).toBe(null);
    expect(parseOrderId('-5')).toBe(null);
    expect(parseOrderId('1000000')).toBe(null);
  });

  it('should return null for non-string inputs', () => {
    expect(parseOrderId(null as any)).toBe(null);
    expect(parseOrderId(undefined as any)).toBe(null);
    expect(parseOrderId(123 as any)).toBe(null);
  });

  it('should extract numbers from mixed strings', () => {
    expect(parseOrderId('#A000123test')).toBe(123);
    expect(parseOrderId('Order#A000456')).toBe(456);
  });
});

describe('isOrderIdFormat', () => {
  it('should detect valid formats', () => {
    expect(isOrderIdFormat('#A000001')).toBe(true);
    expect(isOrderIdFormat('A5')).toBe(true);
    expect(isOrderIdFormat('123')).toBe(true);
    expect(isOrderIdFormat('#A999999')).toBe(true);
    expect(isOrderIdFormat('A1')).toBe(true);
  });

  it('should handle lowercase', () => {
    expect(isOrderIdFormat('#a000001')).toBe(true);
    expect(isOrderIdFormat('a5')).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(isOrderIdFormat('invalid')).toBe(false);
    expect(isOrderIdFormat('')).toBe(false);
    expect(isOrderIdFormat('test@email.com')).toBe(false);
    expect(isOrderIdFormat('ABC123')).toBe(false);
    expect(isOrderIdFormat('#B000001')).toBe(false);
  });

  it('should reject numbers out of range', () => {
    expect(isOrderIdFormat('0')).toBe(false);
    expect(isOrderIdFormat('1234567')).toBe(false); // 7 dígitos
  });

  it('should reject non-string inputs', () => {
    expect(isOrderIdFormat(null as any)).toBe(false);
    expect(isOrderIdFormat(undefined as any)).toBe(false);
    expect(isOrderIdFormat(123 as any)).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(isOrderIdFormat('  A5  ')).toBe(true);
    expect(isOrderIdFormat('  #A000001  ')).toBe(true);
  });
});

describe('formatInvoiceNumber', () => {
  it('should format invoice numbers correctly', () => {
    expect(formatInvoiceNumber(1)).toBe('FV-A000001');
    expect(formatInvoiceNumber(50)).toBe('FV-A000050');
    expect(formatInvoiceNumber(999)).toBe('FV-A000999');
    expect(formatInvoiceNumber(12345)).toBe('FV-A012345');
    expect(formatInvoiceNumber(999999)).toBe('FV-A999999');
  });

  it('should throw on invalid numbers', () => {
    expect(() => formatInvoiceNumber(1000000)).toThrow();
  });

  it('should handle numbers that formatOrderId would return #PENDIENTE', () => {
    // formatInvoiceNumber llama a formatOrderId, que retorna #PENDIENTE para inválidos
    expect(formatInvoiceNumber(0)).toBe('FV-PENDIENTE');
    expect(formatInvoiceNumber(-5)).toBe('FV-PENDIENTE');
  });
});

describe('getDisplayOrderId', () => {
  it('should use order_number when available', () => {
    expect(getDisplayOrderId({ order_number: 1, id: 'uuid-1234' })).toBe('#A000001');
    expect(getDisplayOrderId({ order_number: 999, id: 'uuid-5678' })).toBe('#A000999');
  });

  it('should fallback to UUID slice when order_number is null', () => {
    expect(getDisplayOrderId({ order_number: null, id: 'abcd1234-5678-90ab-cdef-1234567890ab' }))
      .toBe('#ABCD1234');
  });

  it('should fallback to UUID slice when order_number is undefined', () => {
    expect(getDisplayOrderId({ id: 'abcd1234-5678-90ab-cdef-1234567890ab' }))
      .toBe('#ABCD1234');
  });

  it('should fallback to UUID slice when order_number is 0', () => {
    expect(getDisplayOrderId({ order_number: 0, id: '12345678-90ab-cdef-1234-567890abcdef' }))
      .toBe('#12345678');
  });

  it('should fallback to UUID slice when order_number is negative', () => {
    expect(getDisplayOrderId({ order_number: -1, id: 'fedcba98-7654-3210-fedc-ba9876543210' }))
      .toBe('#FEDCBA98');
  });

  it('should handle short UUIDs', () => {
    expect(getDisplayOrderId({ order_number: null, id: 'abc123' }))
      .toBe('#ABC123');
  });
});
