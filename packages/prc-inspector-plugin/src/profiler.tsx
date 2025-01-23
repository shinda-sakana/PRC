import React from 'react';

class PerformanceProbe {
  private scope: PerformanceScope;
  private id: string;
  private startTime: number;
  private duration: number;
  private children: PerformanceProbe[] = [];
  private record = null;
  readonly isRoot: boolean;
  constructor(
    id: string,
    scope: PerformanceScope,
    isRoot = false
  ) {
    this.id = id;
    this.scope = scope;
    this.isRoot = isRoot;
  }
  start() {
    const parent = this.scope.getCurrentProfiling();
    parent?.children.push(this);
    this.scope.addProbe(this);
    this.startTime = performance.now();
  }
  end() {
    this.duration = performance.now() - this.startTime;
    this.onRender?.();
    const currentProfiling = this.scope.getCurrentProfiling();
    if (currentProfiling === this) {
      this.scope.removeLastProbe();
    }
    if (this.isRoot) {
      this.scope.clearScope();
    }
  }
  getDuration() {
    return this.duration;
  }
  getChildren() {
    return Array.from(this.children);
  }
  getId() {
    return this.id;
  }
  readRecord() {
    return this.record;
  }
  private onRender() {
    this.record = resolveRecord(this);
  }
}

export class PerformanceScope {
  private stack: PerformanceProbe[] = [];
  private root: PerformanceProbe;
  getCurrentProfiling() {
    return this.stack.at(-1);
  }
  addProbe(probe: PerformanceProbe) {
    if (probe.isRoot) {
      this.root = probe;
    }
    this.stack.push(probe);
  }
  removeLastProbe() {
    this.stack.pop();
  }
  clearScope() {
    this.stack = [];
  }
  getPerformance() {
    return this.root.readRecord();
  }
}

type ProfilerProps = {
  id: string;
  scope: PerformanceScope;
  isActive: boolean;
  isRoot?: boolean;
  onRender?: (probe: PerformanceProbe) => void;
};

type ProbeProps = {
  probe: PerformanceProbe;
  type: 'start' | 'end';
};

function Probe(props: ProbeProps) {
  const { probe, type } = props;
  switch (type) {
    case 'start': {
      probe.start();
      break;
    }
    case 'end': {
      probe.end();
      break;
    }
    default: {
      break;
    }
  }
  return null;
}

function durationToColor(duration: number) {
  return `#${Math.min(Math.ceil(duration * 15), 15).toString(16)}94`;
}

function convertFlameGraphNode(origin: [string, number]) {
  const [id, duration] = origin;
  return {
    name: `${id}(${duration.toFixed(3)}ms)`,
    value: duration,
    backgroundColor: durationToColor(duration),
    color: '#fff',
    tooltip: `${duration.toFixed(3)}ms`,
  };
}

function resolveRecord(probe: PerformanceProbe) {
  return {
    ...convertFlameGraphNode([probe.getId(), probe.getDuration()]),
    children: probe.getChildren().map(child => (
      resolveRecord(child)
    )),
  };
}

export function Profiler(props: React.PropsWithChildren<ProfilerProps>) {
  const { children, isActive, isRoot, id, scope } = props;
  if (!isActive) {
    return <>{children}</>;
  }
  const probe = new PerformanceProbe(id, scope, isRoot);
  return (
    <>
      <Probe probe={probe} type={'start'} />
      {children}
      <Probe probe={probe} type={'end'} />
    </>
  );
}