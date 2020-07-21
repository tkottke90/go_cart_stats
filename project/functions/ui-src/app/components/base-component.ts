import { LitElement } from 'lit-element';

class BaseComponent extends LitElement {
    createRenderRoot() {
        return this;
    }
}

export {
    BaseComponent
}