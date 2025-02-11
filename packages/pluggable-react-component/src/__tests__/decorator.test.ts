import { describe, it, expect, vi } from 'vitest'
import { BaseFoundation, Event, BindThis } from '../index'

describe('Decorators', () => {
  it('should bind event correctly', () => {
    class TestFoundation extends BaseFoundation {
      @Event('click')
      handleClick(data: string) {
        return data
      }
    }

    const foundation = new TestFoundation()
    const mockListener = vi.fn()
    
    foundation.listen('click', mockListener)
    
    foundation.handleClick('test')
    
    expect(mockListener).toHaveBeenCalledWith('test')
  })

  it('should bind this correctly', () => {
    class TestFoundation extends BaseFoundation {
      private value = 'test'
      
      @BindThis
      getValue() {
        return this.value
      }
    }

    const foundation = new TestFoundation()
    const getValue = foundation.getValue
    
    expect(getValue()).toBe('test')
  })
}) 