interface EventEntity {
  event: string;
  payloads: unknown[];
  retValue: unknown;
}

export class EventLogger {
  private events: EventEntity[] = [];
  private isActive = false;
  log(event: EventEntity) {
    if (!this.isActive) {
      return;
    }
    this.events.push(event);
  }
  clean() {
    this.events = [];
  }
  read() {
    return Object.freeze(this.events);
  }
  activate() {
    this.isActive = true;
  }
  disable() {
    this.isActive = false;
  }
}
