export class HyperplaneWCAdapter extends HTMLElement {
  constructor() {
    super();
    let values = {} as { [ attributeName: string ]: string | null | undefined };
    const observer = new MutationObserver((changes) => {
      changes
        .filter((record): record is MutationRecord & { target: HTMLElement, attributeName: string } => record.type === 'attributes')
        .map(({ target, attributeName }) => [
          attributeName,
          values[ attributeName ],
          values[ attributeName ] = target.getAttribute(attributeName)
        ] as [string, string, string])
        .forEach(([name, oldValue, newValue]) => this.attributeChangedCallback(name, oldValue, newValue));
    });
    observer.observe(this, { attributes: true });
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.dispatchEvent(new CustomEvent('attributeChanged', { detail: [name, oldValue, newValue] }));
  }

  connectedCallback() {
    this.dispatchEvent(new CustomEvent('connected'));
  }

  disconnectedCallback() {
    this.dispatchEvent(new CustomEvent('disconnected'));
  }
}

export function register(creator: (node: HTMLElement) => void, name = creator.name) {
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
