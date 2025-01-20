/* eslint-disable @typescript-eslint/naming-convention */
import { useContext } from 'react';
import { BaseFoundation, ExcludeSelfSlotKeys, SlotOptions } from './base';
import { FoundationContext } from './plugin';
import get from 'lodash/get';

function useAllowUsingInnerHooks(foundation: BaseFoundation) {
  const allowUsingInnerHooks = Reflect.get(foundation, 'allowUsingInnerHooks');
  return allowUsingInnerHooks;
}

export const useFoundation = <F extends BaseFoundation>() => {
  const foundation = useContext(FoundationContext);
  const allowUsingInnerHooks = useAllowUsingInnerHooks(foundation);
  if (!allowUsingInnerHooks) {
    throw new Error('useFoundation could not be used out of rendering');
  }
  return foundation as F;
};

export const useSlot = <
  F extends BaseFoundation,
  C extends Record<string, unknown> = Record<string, unknown>
>(name: ExcludeSelfSlotKeys<F>, options: SlotOptions<C> = {}) => {
  const foundation = useFoundation<F>();
  const allowUsingInnerHooks = useAllowUsingInnerHooks(foundation);
  if (!allowUsingInnerHooks) {
    throw new Error('useSlot could not be used out of rendering');
  }
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

export { BaseFoundation } from './base';
export { Event, BindThis } from './decorator';
export { loadPlugin, Extendable, type Plugin, type ExtendableProps } from './plugin';
