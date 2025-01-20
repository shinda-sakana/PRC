import { BaseFoundation, BindThis, Event } from '@/index';

type Props = {};
type States = {
  foo: number;
  bar: boolean;
};
type Context = {};
type Events = {
  click: (id: string) => void;
};
type Slots = ['button'];

export class ComponentFoundation
  extends BaseFoundation<Props, States, Context, Events, Slots> {
  @BindThis
  @Event('click')
  click(id: string) {
    console.log('click', id);
  }
}
