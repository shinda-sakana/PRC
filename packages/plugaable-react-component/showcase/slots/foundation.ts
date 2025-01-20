import { BaseFoundation } from '@/index';

type Props = {};
type States = {
  foo: number;
  bar: boolean;
};
type Context = {};
type Events = {};
type Slots = ['slot'];

export class ComponentFoundation
  extends BaseFoundation<Props, States, Context, Events, Slots> {
  clickButton() {
    this.setState('foo', i => i + 1);
  }
}
