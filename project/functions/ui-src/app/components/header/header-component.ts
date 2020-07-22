import { html } from 'lit-html';
import { LitElement, property } from 'lit-element';
// import styles from './header.module.css'
import { fromEvent } from 'rxjs';

const tag = 'header-component'

class HeaderElement extends LitElement {
    @property({ type: Boolean }) hidenav = false;
  
    constructor() {
      super();
    }

    firstUpdated() {
      const titleSlot = this.querySelector('[slot="title"]');

      if (titleSlot) {
        fromEvent(titleSlot, 'click')
          .subscribe((event: Event) => {
            this.handleTitleCLick(event);
          });
      }
    }

    render() {

      return html`
        <style>
          .header {
            position: fixed;
            z-index: 1000;
            width: 100%;
            height: 3.5rem;
            background-color: var(--theme-primary);
            color: var(--theme-on-primary);

            display: flex;
            transform: scaleY(1);
            transform-origin: top center;
            transition: all 300ms ease-out;
          }

          :host([invert-colors]) .header {
            transform: scaleY(1.05);
            background-color: rgba(0, 0, 0, 0.55);
            color: var(--theme-primary);
          }

          .header > slot {
            display: flex;
            align-items: center;
          }

          slot[name="menu"] {
            display: ${ this.hidenav ? 'none' : 'block' };
            flex: 0 0 1.5rem;
            padding: 1rem 0.5rem;

            justify-content: center;
          }

          slot[name="title"] {
            flex: 1 1 auto;
            padding: 1rem 0.5rem;
          }

          slot[name="actions"] {
            flex: 0 0 auto;
            padding: 1rem;

            min-width: 1.5rem;
          }

          slot[name="mobile-actions"] {
            display: none;
            flex: 0 0 1.5rem;

            min-width: 1.5rem;
          }

        </style>
        <header class="header">
          <slot name="menu"></slot>
          <slot name="title"></slot>
          <slot name="actions"></slot>
          <slot name="mobile-actions"></slot>
        <header>
      `;
    }

    private handleTitleCLick(event: any) {
      if (event.shiftKey) {
        const theme = window.localStorage.getItem('theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        window.localStorage.setItem('theme', newTheme);

        document.body.setAttribute('theme', newTheme);
      }
    }
}

customElements.define(tag, HeaderElement);

export {
  HeaderElement,
  tag
}