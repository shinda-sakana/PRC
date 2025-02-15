import { BaseFoundation } from '@/index';

type Props = {};
type States = {
  foo: number;
  bar: boolean;
};
type Context = {};
type Events = {};
type Slots = ['child'];

export class ComponentFoundation
  extends BaseFoundation<Props, States, Context, Events, Slots> {
  click() {
    console.log('click');
  }
}
