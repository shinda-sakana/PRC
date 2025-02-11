import { describe, it, expect, vi } from 'vitest'
import { BaseFoundation } from '../base'

describe('BaseFoundation', () => {
  it('should manage states correctly', () => {
    const foundation = new BaseFoundation()
    const mockSetState = vi.fn()
    
    // 模拟states
    Reflect.set(foundation, 'base', {
      states: {
        count: [0, mockSetState]
      }
    })

    // 测试getState
    expect(foundation.getState('count')).toBe(0)
    
    // 测试getStates
    expect(foundation.getStates()).toEqual({ count: 0 })
    
    // 测试setState
    foundation.setState('count', 1)
    expect(mockSetState).toHaveBeenCalledWith(1)
    
    // 测试setState with callback
    foundation.setState('count', prev => prev + 1)
    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should manage context correctly', () => {
    const foundation = new BaseFoundation()
    
    // 模拟context
    Reflect.set(foundation, 'base', {
      context: {
        theme: 'dark'
      }
    })

    // 测试getContext
    expect(foundation.getContext()).toEqual({ theme: 'dark' })
    
    // 测试setContext
    foundation.setContext('theme', 'light')
    expect(foundation.getContext()).toEqual({ theme: 'light' })
  })

  it('should handle events correctly', () => {
    const foundation = new BaseFoundation()
    const mockHandler = vi.fn()
    
    // 测试事件监听
    const removeListener = foundation.listen('click', mockHandler)
    
    // 触发事件
    const handlers = Reflect.get(foundation, 'eventsMap').click
    handlers.forEach(h => h('test'))
    
    expect(mockHandler).toHaveBeenCalledWith('test')
    
    // 测试移除监听
    removeListener()
    expect(handlers.size).toBe(0)
  })

  it('should manage slots correctly', () => {
    const foundation = new BaseFoundation()
    const mockSlot = vi.fn()
    
    foundation.defineSlot({
      header: mockSlot
    })
    
    const slots = Reflect.get(foundation, 'slotMap')
    expect(slots).toHaveProperty('header')
  })
}) 