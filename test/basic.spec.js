import './mocks';
import { HyperplaneWCAdapter, register } from '../hyperplane-wc-adapter';

const { expect } = require('chai');
describe('register', () => {
  it('should create a tag name to match kebab-cased creator function name', () => {
    expect(register(function PascalCasedComponent(_node) {}).tag).to.equal('pascal-cased-component');
    expect(register(function camelCasedComponent(_node) {}).tag).to.equal('camel-cased-component');
    const ArrowFunction = (_node) => {};
    expect(register(ArrowFunction).tag).to.equal('arrow-function');
  });
  it('should create a class that extends HyperplaneWCAdapter named the same as creator function', () => {
    const constructor = register(function PascalCasedComponent(_node) {}).constructor;
    expect(constructor.name).to.equal('PascalCasedComponent');
    expect(new constructor()).to.be.instanceOf(HyperplaneWCAdapter);
  });
  it('should create a class that executes the creator in a constructor', () => {
    let wasCalled = false;
    let calledWith = undefined;
    const constructor = register(function PascalCasedComponent(node) {
      wasCalled = true;
      calledWith = node;
    }).constructor;
    const instance = new constructor();
    expect(wasCalled).to.be.true;
    expect(calledWith).to.equal(instance);
  });
  it('should register a created class as a web component under kebab-cased creator name', () => {
    const constructor = register(function PascalCasedComponent(_node) {}).constructor;
    expect(customElements.get('pascal-cased-component')).to.equal(constructor);
  });
});

describe('HyperplaneWCAdapter', () => {
  it('should have attributeChangedCallback, connectedCallback and disconnectedCallback methods', () => {
    const instance = new HyperplaneWCAdapter();
    expect(instance.attributeChangedCallback).to.be.a('function');
    expect(instance.connectedCallback).to.be.a('function');
    expect(instance.disconnectedCallback).to.be.a('function');
  });
  it('should dispatch `connected` event when connectedCallback is called', () => {
    const instance = new HyperplaneWCAdapter();
    let wasCalled = false;
    instance.addEventListener('connected', () => wasCalled = true);
    instance.connectedCallback();
    expect(wasCalled).to.be.true;
  });
  it('should dispatch `disconnected` event when disconnectedCallback is called', () => {
    const instance = new HyperplaneWCAdapter();
    let wasCalled = false;
    instance.addEventListener('disconnected', () => wasCalled = true);
    instance.disconnectedCallback();
    expect(wasCalled).to.be.true;
  });
  it('should dispatch `attributeChanged` event when attributeChangedCallback is called', () => {
    const instance = new HyperplaneWCAdapter();
    let wasCalled = false;
    instance.addEventListener('attributeChanged', () => wasCalled = true);
    instance.attributeChangedCallback('a', 'b', 'c');
    expect(wasCalled).to.be.true;
  });
  it('should pass attributeChangedCallback params in custom event detail as an array of values in the original properties order', () => {
    const instance = new HyperplaneWCAdapter();
    let calledWith = undefined;
    instance.addEventListener('attributeChanged', (event) => calledWith = event);
    instance.attributeChangedCallback('a', 'b', 'c');
    expect(calledWith).to.deep.contain({ detail: ['a', 'b', 'c'] });
  });
  it('should create a MutationObserver when a class instance is created', () => {
    let observerCreated = false;
    const originalObserver = window.MutationObserver;
    window.MutationObserver = class MutationObserverSpy extends window.MutationObserver {
      constructor(callback) {
        super(callback);
        observerCreated = true;
      }
    };
    new HyperplaneWCAdapter();
    expect(observerCreated).to.be.true;
    window.MutationObserver = originalObserver;
  });
  it('should call attributeChangedCallback whenever MutationObserver detects an attribute change', () => {
    const instance = new HyperplaneWCAdapter();
    let wasCalled = false;
    instance.attributeChangedCallback = () => wasCalled = true
    instance.setAttribute('test1', 'a');
    expect(wasCalled).to.be.true;
  });
  it('should remember the old value whenever MutationObserver detects an attribute change', () => {
    const instance = new HyperplaneWCAdapter();
    let calledWith = Array.from({ length: 3 });
    instance.attributeChangedCallback = (name, oldValue, newValue) => calledWith = [name, oldValue, newValue]
    instance.setAttribute('test1', 'a');
    expect(calledWith).to.deep.equal(['test1', undefined, 'a']);
    instance.setAttribute('test2', 'b');
    expect(calledWith).to.deep.equal(['test2', undefined, 'b']);
    instance.setAttribute('test1', 'c');
    expect(calledWith).to.deep.equal(['test1', 'a', 'c']);
  });
});
