import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn', () => {
  it('merges multiple class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('deduplicates conflicting tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('handles conditional objects', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b')
  })

  it('flattens array inputs', () => {
    expect(cn(['a', ['b']])).toBe('a b')
  })
})
