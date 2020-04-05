import { EventEmitter } from 'events';

(global as any).window = global;

window.HTMLElement = class HTMLElement {
  emitter = new EventEmitter();
  attributes = new Map();

  addEventListener(type: string, callback: (...args: any[]) => void) {
    this.emitter.on(type, callback);
  }

  dispatchEvent(event: CustomEvent) {
    this.emitter.emit(event.type, event);
  }

  getAttribute(qualifiedName: string) {
    return this.attributes.get(qualifiedName);
  }

  setAttribute(qualifiedName: string, value: string) {
    this.attributes.set(qualifiedName, value);
    this.emitter.emit('@attributeChanged', qualifiedName, value);
  }
} as any;
window.CustomEvent = class CustomEvent {
  constructor(public type: string, eventInitDict: CustomEventInit) {
    Object.assign(this, eventInitDict);
  }
} as any

window.MutationObserver = class MutationObserver {
  constructor(private callback: (changes: MutationRecord[]) => void) {}

  observe(node: Node, _options: MutationObserverInit): void {
    node.addEventListener('@attributeChanged', (attributeName: any) => {
      this.callback([{ type: 'attributes', target: node, attributeName } as MutationRecord])
    });
  }
} as any;
window.customElements = {
  registry: new Map(),
  define(name: string, constructor: CustomElementConstructor, _options?: ElementDefinitionOptions): void {
    this.registry.set(name, constructor);
  },
  get(name: string) {
    return this.registry.get(name);
  }
} as any;
