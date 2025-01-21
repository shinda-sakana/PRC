/* eslint-disable no-multi-assign */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-explicit-any */
import isFunction from 'lodash/isFunction';
import { BaseFoundation, EventsMap, TDefaultContext, TDefaultProps, TDefaultSlots, TDefaultStates } from './base';

type AnyF<F> = F extends (...args: infer A) => void ? (...args: A) => any : never;
type VMap<M, E> = M extends EventsMap<infer Map> ? E extends keyof Map ? Map[E]: never : never;

type EMap<F extends BaseFoundation> = (
  F extends BaseFoundation<
    TDefaultProps,
    TDefaultStates,
    TDefaultContext,
    infer E,
    TDefaultSlots
  >
    ? EventsMap<E>
    : never
);

export const Event = function <
  F extends BaseFoundation,
  M = EMap<F>,
  E extends keyof M = keyof M
> (event: E) {
  const Decorator = function (
    _target: F,
    _key: string,
    descriptor: TypedPropertyDescriptor<AnyF<VMap<M, E>>>
  ) {
    const old = descriptor.value;    
    if (isFunction(old)) {
      return {
        configurable: true,
        value: function (this: F, ...args: unknown[]) {
          const eventsMap = Reflect.get(this, 'eventsMap');
          const ret = old.call(this, ...args);
          const handlers = eventsMap[event as string];
          const anyEventsHandlers = Reflect.get(this, 'anyEventsHandlers');
          switch (true) {
            case (handlers instanceof Set): {
              try {
                handlers.forEach(handler => handler(...args));
              } catch (e) {
                console.error(e);
              }
            }
            case (anyEventsHandlers instanceof Set): {
              try {
                anyEventsHandlers.forEach(handler => handler(event, args, ret));
              } catch (e) {
                console.error(e);
              }
            }
          }
          return ret;
        }
      };
    }
    return descriptor;
  };
  return Decorator;
};

export const BindThis = function <F extends BaseFoundation> (
  _target: F,
  _key: string,
  descriptor: PropertyDescriptor
) {
  const old = descriptor.value;
  const memoSymbol = Symbol('memo');
  if (isFunction(old)) {
    return {
      configurable: true,
      get() {
        let memo: typeof old = this[memoSymbol];
        if (!memo) {
          memo = this[memoSymbol] = old.bind(this);
        }
        return memo;
      },
    };
  }
  return descriptor;
};
