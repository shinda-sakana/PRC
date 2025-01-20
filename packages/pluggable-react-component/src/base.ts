import type { Dispatch, SetStateAction } from 'react';
import isFunction from 'lodash/isFunction';
import set from 'lodash/set';

type StatePair<T> = [T, Dispatch<SetStateAction<T>>];

export type States<R extends Record<string, unknown>> = {
  [K in keyof R]: StatePair<R[K]>
};

export type TDefaultProps = unknown;
export type TDefaultStates = Record<string, unknown>;
export type TDefaultContext = Record<string, unknown>;
export type TDefaultEventsMap = Record<string, DefaultHandler>;
export type TDefaultSlots = string[];

/* eslint-disable @typescript-eslint/naming-convention */
export interface AdapterBase <
  P = TDefaultProps,
  S = States<TDefaultStates>,
  C = TDefaultContext,
> {
  states: S;
  props: P;
  context: C;
};

export type DefaultHandler = (...payload: unknown[]) => unknown;

export type EventsMap<E extends TDefaultEventsMap> = Partial<{
  [K in keyof E]: Set<E[K]>;
}>;

type SlotRender = (prev: JSX.Element, ctx: Record<string, any>, origin: JSX.Element) => JSX.Element;

type SlotMap<X extends TDefaultSlots> = {
  [K in (X[number] | 'self')]: JSX.Element | SlotRender;
};

export type PartialSlotMap<X extends TDefaultSlots> = Partial<SlotMap<X>>;

export type SlotOptions<C extends Record<string, unknown> = Record<string, unknown>> = {
  origin?: JSX.Element;
  ctx?: C;
};

export type SlotKeys<F extends BaseFoundation> = (
  F extends BaseFoundation<
    TDefaultProps,
    TDefaultStates,
    TDefaultContext,
    TDefaultEventsMap,
    infer X
  >
    ? keyof SlotMap<X>
    : never
);

export type ExcludeSelfSlotKeys<F extends BaseFoundation> = Exclude<SlotKeys<F>, 'self'>;

export class BaseFoundation<
  P extends TDefaultProps = TDefaultProps,
  S extends TDefaultStates = TDefaultStates,
  C extends TDefaultContext = TDefaultContext,
  E extends TDefaultEventsMap = TDefaultEventsMap,
  X extends TDefaultSlots = TDefaultSlots,
> {
  private slotMap: PartialSlotMap<X> = {};
  private eventsMap: EventsMap<E> = {};
  private base: AdapterBase<P, States<S>, C>;
  getState<K extends keyof S>(key: K): undefined | S[K] {
    if (!this.base) {
      return void 0;
    }
    const state = this.base.states[key];
    if (!state) {
      return void 0;
    }
    return state[0];
  }
  getStates(): Partial<S> {
    if (!this.base) {
      return {};
    }
    const { states } = this.base;
    return Object.entries(states).reduce(
      (final, [key, val]) => Object.assign(final, {
        [key]: val[0],
      }), {}
    );
  }
  setState<K extends keyof S = keyof S>(key: K, value: SetStateAction<S[K]>): void;
  setState<K extends keyof S = keyof S>(key: K): (value: SetStateAction<S[K]>) => void;
  setState<K extends keyof S = keyof S>(key: K, value?: SetStateAction<S[K]>) {
    type This = BaseFoundation<P, S, C, E, X>;
    function writeValue(this: This, val: SetStateAction<S[K]>) {
      if (!this.base) {
        return;
      }
      const state = this.base.states[key] || [];
      const setState = state[1];
      if (isFunction(setState)) {
        setState(val);
      }
    }
    if (arguments.length < 2) {
      return writeValue.bind(this);
    }
    writeValue.call(this, value);
  }
  getProps(): Partial<P> {
    if (!this.base) {
      return {};
    }
    return this.base.props;
  }
  getContext(): Partial<C> {
    if (!this.base) {
      return {};
    }
    return { ...this.base.context };
  }
  setContext<K extends keyof C>(key: K, value: C[K]) {
    if (!this.base) {
      return;
    }
    set(this.base, ['context', key], value);
  }
  listen<K extends keyof E>(event: K, handler: E[K]) {
    const handlers = this.eventsMap[event] || new Set();
    handlers.add(handler);
    this.eventsMap[event] = handlers;
    return function remove() {
      handlers.delete(handler);
    };
  }
  defineSlot(slotMap: PartialSlotMap<X>) {
    if (!slotMap) {
      return;
    }
    Object.entries(slotMap).forEach(([name, slotRender]) => {
      if (typeof slotRender === 'function') {
        const existRender = this.slotMap[name];
        Object.assign(this.slotMap, {
          [name]: function(origin: JSX.Element, ctx: Record<string, unknown>) {
            let prev: JSX.Element = existRender === void 0 ? origin : existRender;
            if (typeof existRender === 'function') {
              prev = existRender(origin, ctx);
            }
            return slotRender(prev, Object.freeze(ctx), origin);
          }
        });
      } else {
        Object.assign(this.slotMap, {
          [name]: slotRender,
        });
      }
    });
  }
}
