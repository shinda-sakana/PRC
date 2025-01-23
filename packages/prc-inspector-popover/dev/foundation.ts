import { BaseFoundation, BindThis, Event } from '@shinda-sakana/pluggable-react-component';

type Props = {};
type States = {
  inputValue: string;
  clickCount: number;
};
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
  click() {
    this.setState('clickCount', i => i + 1);
  }
  @BindThis
  @Event('input')
  input(val: string) {
    this.setState('inputValue', val);
    return val;
  }
}