import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { provinceFor, provinces } from '../src/services/provinces.ts';

test('official province names and former provinces map only from explicit address parts', () => {
  assert.equal(Object.keys(provinces).length, 34);
  assert.equal(provinceFor('Phường Minh An, Quảng Nam'), 'Đà Nẵng');
  assert.equal(provinceFor('Kiên Giang'), 'An Giang');
  assert.equal(provinceFor('Quận 1, TP. Hồ Chí Minh'), 'Hồ Chí Minh');
  assert.equal(provinceFor('Khách sạn Đà Nẵng đẹp'), null);
  assert.equal(provinceFor(''), null);
});
