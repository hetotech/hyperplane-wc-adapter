export declare class HyperplaneWCAdapter extends HTMLElement {
    constructor();
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
export declare function register<T extends HTMLElement>(creator: (node: T) => void, name?: string): {
    name: string;
    tag: string;
    constructor: {
        new (): T;
    };
};
