export class HyperplaneWCAdapter extends HTMLElement {
  constructor() {
    super();
    let values = {};
    const observer = new MutationObserver((changes) => {
      changes
        .filter((record) => record.type === 'attributes')
        .map(({ target, attributeName }) => [
          attributeName,
          values[ attributeName ],
          values[ attributeName ] = target.getAttribute(attributeName)
        ])
        .forEach(([name, oldValue, newValue]) => this.attributeChangedCallback(name, oldValue, newValue));
    });
    observer.observe(this, { attributes: true });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.dispatchEvent(new CustomEvent('attributeChanged', { detail: [name, oldValue, newValue] }));
  }

  connectedCallback() {
    this.dispatchEvent(new CustomEvent('connected'));
  }

  disconnectedCallback() {
    this.dispatchEvent(new CustomEvent('disconnected'));
  }
}

/**
 * @param {function(HTMLElement): void} creator
 * @param {string} name
 */
export function register(creator, name = creator.name) {
  const kebabCased = name.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}-${b}`).toLowerCase();
  if (kebabCased.split(('-')).length < 2) {
    throw new Error(
      'Name must consist of at least 2 dash-separated parts.'
      + (name === creator.name ? 'Please provide an implicit name to the `register` function or change the creator' +
      ' function name to be at least 2 words camelCased or PascalCased' : '')
    );
  }
  const tmp = {
    [ name ]: class extends HyperplaneWCAdapter {
      constructor() {
        super();
        creator(this);
      }
    }
  }
  const constructor = tmp[ name ];
  customElements.define(kebabCased, constructor);
  return {
    name,
    tag: kebabCased,
    constructor
  }
}
