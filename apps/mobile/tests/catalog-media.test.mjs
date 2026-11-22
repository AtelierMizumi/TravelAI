import test from 'node:test';
import assert from 'node:assert/strict';
import { destinationFor } from '../src/services/catalog-media.ts';
test('tour destination images match location without confusing nearby hotels or guessing from province', () => {
 const places=[{name:'Cầu Rồng',imageUrl:'https://example.test/dragon.jpg'},{name:'Hội An',imageUrl:'https://example.test/hoi-an.jpg'}];
 assert.equal(destinationFor('Cau Rong',places)?.imageUrl,places[0].imageUrl);
 assert.equal(destinationFor('Đà Nẵng',places),undefined);
 assert.equal(destinationFor('',places),undefined);
});
