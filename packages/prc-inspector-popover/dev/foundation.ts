import { BaseFoundation, BindThis, Event } from '@shinda-sakana/pluggable-react-component';

type Props = {};
type States = {};
type Context = {};
type Events = {
  click: () => void;
  input: (val: string) => void;
};
type Slots = [];

export class ComponentFoundation
  extends BaseFoundation<Props, States, Context, Events, Slots> {
  @BindThis
  @Event('click')
  click() {}
  @BindThis
  @Event('input')
  input(val: string) {
    return val;
  }
}