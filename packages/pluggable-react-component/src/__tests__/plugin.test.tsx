import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BaseFoundation, Extendable, loadPlugin } from '../index'

describe('Plugin System', () => {
  it('should apply plugins correctly', () => {
    class TestFoundation extends BaseFoundation<{ text: string }> {}
    
    const TestComponent = Extendable(
      ({ foundation }) => (
        <div data-testid="test">
          {foundation.getProps().text}
        </div>
      ),
      TestFoundation,
      () => ({
        states: {},
        context: {}
      })
    )

    const plugin = {
      usePropsHandler: (props) => ({
        ...props,
        text: 'Modified by plugin'
      }),
      init: vi.fn(),
      destroy: vi.fn()
    }

    const PluginedComponent = loadPlugin(TestComponent, [plugin])
    
    render(<PluginedComponent text="test" />)
    
    expect(screen.getByTestId('test')).toHaveTextContent('Modified by plugin')
    expect(plugin.init).toHaveBeenCalled()
  })

  it('should handle slots correctly', () => {
    class TestFoundation extends BaseFoundation {}
    
    const TestComponent = Extendable(
      ({ slot }) => (
        <div data-testid="test">
          {slot('content', {
            origin: <span>Original</span>
          })}
        </div>
      ),
      TestFoundation,
      () => ({
        states: {},
        context: {}
      })
    )

    const plugin = {
      usePreRender: () => ({
        content: () => <span>Modified</span>
      })
    }

    const PluginedComponent = loadPlugin(TestComponent, [plugin])
    
    render(<PluginedComponent />)
    
    expect(screen.getByTestId('test')).toHaveTextContent('Modified')
  })
}) 