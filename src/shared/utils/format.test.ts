import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatMoney,
  formatPercent,
  formatQuantity,
  formatSignedMoney,
} from './format';

describe('formatMoney', () => {
  it('formatea DOP con dos decimales y separador de miles', () => {
    expect(formatMoney(84320.75)).toBe('DOP 84,320.75');
    expect(formatMoney(0)).toBe('DOP 0.00');
  });

  it('admite otra moneda de forma explícita', () => {
    expect(formatMoney(1250.5, 'USD')).toBe('USD 1,250.50');
  });
});

describe('formatSignedMoney', () => {
  it('antepone el signo correspondiente', () => {
    expect(formatSignedMoney(12450)).toBe('+DOP 12,450.00');
    expect(formatSignedMoney(-1850)).toBe('−DOP 1,850.00');
    expect(formatSignedMoney(0)).toBe('DOP 0.00');
  });
});

describe('formatQuantity', () => {
  it('agrupa miles', () => {
    expect(formatQuantity(1234)).toBe('1,234');
  });
});

describe('formatDate', () => {
  it('interpreta la fecha como día local sin desfase', () => {
    expect(formatDate('2026-11-17')).toBe('17 nov de 2026');
  });
});

describe('formatPercent', () => {
  it('convierte fracciones en porcentajes', () => {
    expect(formatPercent(0.32)).toBe('32%');
  });
});
