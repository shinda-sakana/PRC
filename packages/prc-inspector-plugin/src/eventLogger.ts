interface EventEntity {
  event: string;
  payloads: unknown[];
  retValue: unknown;
  extraArguments: Record<string, unknown>;
}

export class EventLogger {
  private events: EventEntity[] = [];
  private isActive = false;
  log(event: EventEntity) {
    if (!this.isActive) {
      return;
    }
    this.events.push(Object.freeze(event));
  }
  clean() {
    this.events = [];
  }
  read() {
    return [...this.events];
  }
  activate() {
    if (!this.isActive) {
      this.clean();
    }
    this.isActive = true;
  }
  disable() {
    this.isActive = false;
  }
}
