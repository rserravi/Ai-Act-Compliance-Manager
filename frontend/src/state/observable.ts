export type Unsubscribe = () => void;

export type Listener = () => void;

export class ObservableValue<T> {
  #value: T;
  #listeners: Set<Listener> = new Set();

  constructor(initialValue: T) {
    this.#value = initialValue;
  }

  get value(): T {
    return this.#value;
  }

  set value(next: T) {
    if (Object.is(this.#value, next)) {
      return;
    }
    this.#value = next;
    this.#notify();
  }

  update(updater: (current: T) => T): void {
    this.value = updater(this.#value);
  }

  subscribe(listener: Listener): Unsubscribe {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  #notify(): void {
    for (const listener of [...this.#listeners]) {
      listener();
    }
  }
}
