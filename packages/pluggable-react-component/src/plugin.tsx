/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { AdapterBase, BaseFoundation, SlotKeys, PartialSlotMap, States, TDefaultContext, TDefaultEventsMap, TDefaultProps, TDefaultSlots, TDefaultStates, SlotOptions, ExcludeSelfSlotKeys } from './base';
import { compose } from './utils';
import get from 'lodash/get';
import FeatureFlags from './featureFlags';

type FoundationSlots<F extends BaseFoundation> = (
  F extends BaseFoundation<
    TDefaultProps,
    TDefaultStates,
    TDefaultContext,
    TDefaultEventsMap,
    infer X
  >
  ? X
  : never
);

export type PluginCallback<F extends BaseFoundation> = (foundation: F) => void;
export type PluginRender<F extends BaseFoundation> = (foundation: F) => void | PartialSlotMap<FoundationSlots<F>>;
export type PluginhandleProps<F extends BaseFoundation> = (props: FoundationProps<F>) => FoundationProps<F>;
type SimplePlugin<F extends BaseFoundation> = {
  init?: PluginCallback<F>;
  usePropsHandler?: PluginhandleProps<F>;
  usePreRender?: PluginRender<F>;
  destroy?: PluginCallback<F>;
};
type CallbackPlugin<F extends BaseFoundation> = () => SimplePlugin<F>;
export type Plugin<F extends BaseFoundation> = SimplePlugin<F> | CallbackPlugin<F>;

export const PluginContext = createContext<Plugin<BaseFoundation>[]>([]);

export const FoundationContext = createContext(new BaseFoundation());

const PluginContextProvider = function ({ value, children }) {
  const originPlugins = useContext(PluginContext);
  const plugins = [...originPlugins, ...value];
  return (
    <PluginContext.Provider value={plugins}>
      {children}
    </PluginContext.Provider>
  );
};

export const loadPlugin = function <P extends Record<string, unknown>>(
  Constructor: React.FC<P>,
  plugins: Plugin<BaseFoundation>[]
) {
  const HOC = function (props: P) {
    return (
      <PluginContextProvider value={plugins}>
        <Constructor {...props} />
      </PluginContextProvider>
    );
  };
  return HOC;
};

export type ExtendableProps<F extends BaseFoundation> = {
  foundation: F;
  slot: <C extends Record<string, unknown> = Record<string, unknown>> (name: ExcludeSelfSlotKeys<F>, options?: SlotOptions<C>) => JSX.Element;
};

type FoundationBase<F extends BaseFoundation> = (
  F extends BaseFoundation<
    infer P,
    infer S,
    infer C,
    TDefaultEventsMap,
    TDefaultSlots
  >
  ? AdapterBase<P, States<S>, C>
  : never
);

type FoundationProps<F extends BaseFoundation> = FoundationBase<F>['props'];

type AdapterBaseHook<F extends BaseFoundation> = (props: FoundationProps<F>) => Pick<FoundationBase<F>, 'states' | 'context'>;

class PluginStep {
  private step: PluginCallback<BaseFoundation>;
  constructor(step: PluginCallback<BaseFoundation>) {
    this.step = step;
  }
  call(f: BaseFoundation) {
    this.step.call(null, f);
  }
  render(f: BaseFoundation) {
    const elem = this.step.call(null, f);
    return elem;
  }
}

export function Extendable<F extends BaseFoundation, T>(
  render: (props: ExtendableProps<F>, ref?: React.ForwardedRef<T>) => JSX.Element,
  FoundationClass: { new(): F },
  useAdapterBase: AdapterBaseHook<F>
) {
  const HOC = function (props: FoundationProps<F>, ref?: React.ForwardedRef<T>) {
    const plugins = useContext(PluginContext);
    const [inits, handleProps, preRenders, destroies] = useMemo(() => (
      plugins.reduce(([_inits, _handlePropsFn, _preRenders, _destroies], plugin) => {
        const {
          init,
          usePropsHandler: handlePropsFn,
          usePreRender: preRender,
          destroy,
        } = typeof plugin === 'function' ? plugin() : plugin;
        if (typeof init === 'function') {
          _inits.push(new PluginStep(init));
        }
        if (typeof handlePropsFn === 'function') {
          _handlePropsFn.push(handlePropsFn);
        }
        if (typeof preRender === 'function') {
          _preRenders.push(new PluginStep(preRender));
        }
        if (typeof destroy === 'function') {
          _destroies.push(new PluginStep(destroy));
        }
        return [_inits, _handlePropsFn, _preRenders, _destroies];
      }, [[], [], [], []] as [
        Array<PluginStep>,
        Array<PluginhandleProps<F>>,
        Array<PluginStep>,
        Array<PluginStep>,
      ])
    ), []);
    const newProps = compose(handleProps)(props);
    const foundation = useMemo(() => {
      const f = new FoundationClass();
      Reflect.set(f, 'base', { props: newProps });
      inits.forEach(init => init.call(f));
      return f;
    }, []);
    const base = useAdapterBase(newProps);
    const oldBase = Reflect.get(foundation, 'base');
    const newContext = Object.assign({}, oldBase?.context, base?.context);
    Reflect.set(foundation, 'base', Object.assign({}, oldBase, base, {
      props: newProps,
      context: newContext,
    }));
    if (FeatureFlags.BaseFoundationSyncStates) {
      Reflect.set(foundation, 'syncStates', foundation.getStates());
    }
    Reflect.set(foundation, 'slotMap', {});
    preRenders.forEach(pre => {
      const slotMap = pre.render(foundation);
      foundation.defineSlot(slotMap);
    });
    function slot(name: SlotKeys<BaseFoundation>, options: SlotOptions = {}) {
      const { origin = null, ctx = {} } = options;
      const target = get(foundation, ['slotMap', name]);
      if (typeof target === 'function') {
        return target(origin, ctx);
      }
      if (target === void 0) {
        return origin;
      }
      return target;
    };
    const component = slot('self', {
      origin: render({ foundation, slot }, ref),
    });
    useEffect(() => () => {
      destroies.forEach(destroy => destroy.call(foundation));
    }, []);
    Reflect.set(foundation, 'allowUsingInnerHooks', true);
    return (
      <FoundationContext.Provider value={foundation}>
        <PluginContext.Provider value={[]}>
          {component}
        </PluginContext.Provider>
      </FoundationContext.Provider>
    );
  };
  return HOC;
};
