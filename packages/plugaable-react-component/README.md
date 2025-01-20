# PRC
Pluggable React Component

# Show Case
RUN `npm run showcase` and open
- http://localhost:4444/showcase/normal/index.html
- http://localhost:4444/showcase/slots/index.html
- http://localhost:4444/showcase/hooks/index.html
- http://localhost:4444/showcase/events/index.html

# Usage

## Define a extendable component
```tsx
/* foundation.ts */
type Props = {};
type States = {};
type Context = {};
type Events = {};
type Slots = [];
export class ComponentFoundation
  extends BaseFoundation<Props, States, Context, Events, Slots> {
}
/* Component.tsx */
function useRender({ foundation, slot }) {
  return /* render JSX */;
}
function useAdapter(props) {
  return {
    states: {}, // component states initer
    context: {}, // component context initer
  };
}
const ExtendableComponent = Extendable(
  useRender,
  ComponentFoundation,
  useAdapter
);
```

## Load a plugin at extendable component
```tsx
function DemoPlugin(): Plugin<ComponentFoundation> {
  return {
    usePropsHandler(props) {
      return {}; // props modify
    },
    usePreRender(f) {
      return {}; // slots implement
    },
    init(f) {
      // do some init action
    },
    destroy(f) {
      // do some destroy action
    }
  };
}

loadPlugin(Component, [
  DemoPlugin(),
]);
```

## Add addition props in plugin
```tsx
function AdditionPropsPlugin(): Plugin<ComponentFoundation> {
  return {
    usePropsHandler(props) {
      return {
        ...props,
        addtionProps: 'this is addition props'
      }
    }
  };
}
```

## Define and use slots
at the hook function `usePreRender` of plugin, you could return a slots-map
to implement slots which declared by extendable component
each value in the slots-map could be a function or a JSX element\
**function definition**\
`(prev, ctx, origin) => JSX.Element`
- **prev**: every plugins have right to implement the same slot, and the
plugin loaded late could implement base on the implementation of before 
plugin, the `prev` argument is the before-plugin's JSX implementation
- **ctx**: every slots could define a context by extendable component
- **origin**: extendable component could define a origin JSX structure as 
original JSX
```tsx
/* foundation.ts */
type Slots = ['slotname'];
class ComponentFoundation
  extends BaseFoundation<Props, States, Context, Events, Slots> {
}
/* Component.tsx */
function Child() {
  // render slot by using useSlot at children component
  const slotElem = useSlot('slotname');
  return /* children JSX */;
}
function useRender({ slot }) {
  // render slot by using slot function at root
  // do not using useSlot here
  const slotElem = slot('slotname', {
    origin: /* original slot JSX */,
    ctx: /* ctx object */,
  });
  return /* root JSX */;
}
/* plugins */
function SlotPlugin(): Plugin<ComponentFoundation> {
  return {
    usePreRender() {
      return {
        slotname(prev, ctx, origin) {
          return /* slot implement JSX */;
        }
      };
    }
  };
}
```

## Define and use events
```tsx
/* foundation.ts */
type Events = {
  ['event_name']: () => void;
};
class ComponentFoundation
  extends BaseFoundation<Props, States, Context, Events, Slots> {
  @BindThis
  @Event('event_name')
  action() {
    // implement of action
  }
}
/* Component.tsx */
function useRender({ foundation, slot }) {
  const callAction = () => {
    // after call the function, the event bind on it will be send to listeners
    foudation.action();
  };
  return /* render JSX */;
}
/* plugins */
function EventPlugin(): Plugin<ComponentFoundation> {
  return {
    init(f) {
      f.listen('event_name', () => {
        // function will be called while receive the event
      });
    }
  };
}
```
