import assert from 'node:assert/strict'
import { test } from 'node:test'

test('synchronous passing test', () => {
  assert.strictEqual(1, 1)
})
