import { EventEmitter } from 'events';

global.window = global;

window.HTMLElement = class HTMLElement {
  emitter = new EventEmitter();
  attributes = new Map();

  addEventListener(type, callback) {
    this.emitter.on(type, callback);
  }

  dispatchEvent(event) {
    this.emitter.emit(event.type, event);
  }

  getAttribute(qualifiedName) {
    return this.attributes.get(qualifiedName);
  }

  setAttribute(qualifiedName, value) {
    this.attributes.set(qualifiedName, value);
    this.emitter.emit('@attributeChanged', qualifiedName, value);
  }
};
window.CustomEvent = class CustomEvent {
  constructor(type, eventInitDict) {
    this.type = type;
    Object.assign(this, eventInitDict);
  }
}

window.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(node, _options) {
    node.addEventListener('@attributeChanged', (attributeName) => {
      this.callback([{ type: 'attributes', target: node, attributeName }])
    });
  }
};
window.customElements = {
  registry: new Map(),
  define(name, constructor, _options) {
    this.registry.set(name, constructor);
  },
  get(name) {
    return this.registry.get(name);
  }
};
