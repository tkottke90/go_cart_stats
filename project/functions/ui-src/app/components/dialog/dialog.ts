import { LitElement, html, property } from 'lit-element';

const tag = 'dialog-component'

class DialogComponent extends LitElement {

  @property({ type: Boolean }) clickClose: boolean = true;
  @property({ type: Boolean}) open: boolean = false;

  render() {
    return html`
      <style>
        .container {
          position: fixed;
          width: 100%;
          height: 100%;
          z-index: 1000;
          top: 0;
          left: 0;
          right: 0;
          opacity: 0;
          transform: scale(0);

          transform-origin: center;
          transition: opacity 500ms ease-out;
        }

        .container[enabled] {
          opacity: 1;
          transform: scale(1);
        }

        .overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.5;

          background-color: var(--overlay);
        }

        .content {
          margin: 1rem;
          padding: 1rem;

          background-color: var(--background);
          box-shadow: var(--elevation-2); 

          z-index: 1010;
          position: relative;

          transform-origin: top center;
          transform: translateY(-10);
          opacity: 0;

          transition: all 500ms var(--decelerate-bezier, ease-out) 250ms;
        }

        .container[enabled] > .content {
          transform: translateY(0);
          opacity: 1;
        }
      </style>
      <div class="container" ?enabled=${this.open}>
        <div class="overlay" @click="${this.overlayClose}" ></div>
        <div class="content">
          <slot name="header"></slot>
          <slot name="sub-header"></slot>
          <slot></slot>
          <slot name="actions"></slot>
        </div>
      </div>
    `
  }

  public close() {
    this.open = false;
    this.requestUpdate();
  }

  private overlayClose() {
    if (this.clickClose) {
      this.close();
    }
  }
}

customElements.define(tag, DialogComponent);

export {
  DialogComponent,
  tag
}