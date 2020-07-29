import { html } from 'lit-html';
import { LitElement, property } from 'lit-element';
// import styles from './header.module.css'
import { fromEvent } from 'rxjs';

const tag = 'custom-button'

class CustomButtonElement extends LitElement {

  @property({ type: String }) label = '';
  @property({ type: String }) type: 'normal' | 'outlined' | 'raised' = 'normal';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) mobileIcon = false;
  @property({ type: Boolean }) noRipple = false;
  @property({ type: String }) align: 'left' | 'center' | 'right' = 'left';
  @property({ type: String }) padding = '';

  firstUpdated() {
    const button = this.shadowRoot!.querySelector('button') as HTMLButtonElement;
    const ripple = button.querySelector('.ripple') as HTMLSpanElement;

    ripple.style.width = ripple.style.height = `${Math.max(button.clientHeight, button.clientWidth)}px`;

    fromEvent(window, 'resize')
      .subscribe( event => {
        this.setMobileIcon();
      });

    fromEvent(button, 'click')
      .subscribe((event) => {
        this.rippleEffect(event, button); 
      });
  }

  render() {
    return html`
      <style>
        :host {
          --disabled-gray: #0005;
          --elevation-2: 0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);
        }

        button {
          position: relative;
          border: none;
          border-radius: 0.125rem;
          padding: ${ this.padding ? this.padding : '0.75rem 1.125rem'};
          font-size: var(--custom-button-font, 1rem);
          text-transform: uppercase;
          cursor: pointer;
          outline: none;

          display: flex;
          overflow: hidden;
        }
      
        button.normal { background-color: transparent }

        button.normal, button.normal[color="primary"] {
          color: var(--theme-primary, purple);
        }
        
        button.normal[color="on-primary"] {
          color: var(--theme-on-primary, white);
        }

        button.normal[color="accent"] {
          color: var(--theme-accent, yellow);
        }

        button.normal[color="on-accent"] {
          color: var(--theme-on-accent, black);
        }

        button.normal[color="warn"] {
          color: var(--theme-warn, red);
        }

        button.normal[color="on-warn"] {
          color: var(--theme-on-warn, white);
        }

        button.raised, button.raised[color="primary"] {
          color: var(--theme-on-primary, white);
          background-color: var(--theme-primary, purple);
          box-shadow: var(--elevation-2);
        }

        button.raised[color="accent"] {
          color: var(--theme-on-accent);
          background-color: var(--theme-accent, yellow);
          box-shadow: var(--elevation-2);
        }

        button.raised[color="warn"] {
          color: var(--theme-on-warn);
          background-color: var(--theme-warn);
          box-shadow: var(--elevation-2);
        }

        button.outlined { background-color: transparent }

        button.outlined, button.outlined[color="primary"] {
          color: var(--theme-primary, purple);
          border: 2px solid var(--theme-primary, purple);
        }

        button.outlined[color="accent"] {
          color: var(--theme-accent, yellow);
          border: 2px solid var(--theme-accent, yellow);
        }

        button.outlined[color="warn"] {
          color: var(--theme-warn);
          border: 2px solid var(--theme-warn);
        }

        button.outlined[color="on-primary"] {
          color: var(--theme-on-primary);
          border: 2px solid var(--theme-primary);
        }

        button.outlined[color="on-accent"] {
          color: var(--theme-on-accent);
          border: 2px solid var(--theme-accent);
        }

        button.outlined[color="on-warn"] {
          color: var(--theme-on-warn);
          border: 2px solid var(--theme-warn);
        }

        button:disabled {
          color: var(--disabled-gray);
          pointer-events: none;
          cursor: none;
        }

        button.raised:disabled {
          color: #cecece;
          background-color: var(--disabled-gray);
          box-shadow: none;
        }

        button.outlined:disabled {
          color: var(--disabled-gray);
          border-color: var(--disabled-gray);
        }

        .label {
          display: ${ this.label.length > 0 ? 'inline-block' : 'none' };
          margin: 0 0.5rem;
          line-height: 24px;
        }

        button[mobile-icon="mobile-button"] > .label {
          display: none;
          margin: 0;
        }

        button[align="center"] {
          margin: auto;
        }

        button[align="right"] {
          margin-left: auto;
        }

        .ripple {
          position: absolute;
          background: rgba(0,0,0,.15);
          border-radius: 100%;
          transform: scale(0);
          pointer-events: none;
          opacity: 1;
        }

        .ripple.show {
          animation: ripple .75s ease-out;
        }

        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }

      </style>
      <button
        align="${this.align}"
        mobile-icon="${this.setMobileIcon()}"
        color="${this.getAttribute('color')}"
        class="${this.type}" 
        .disabled=${this.disabled}
      >
        <slot name="prefixIcon"></slot>
        <span class="label">${this.label}</span>
        <slot name="suffixIcon"></slot>
        <span class="ripple"></span>
      </button>
    `;
  }

  private setMobileIcon(): string {
    if (this.mobileIcon) {
      const query = window.matchMedia('(max-width: 600px)').matches;
      return query ? 'mobile-button': '';
    }
    return '';
  }

  private rippleEffect(e: any, target: HTMLButtonElement) {
    if (this.noRipple) return;
    
    const targetRect = target.getBoundingClientRect();
    const ripple = target.querySelector('.ripple') as HTMLElement;
    const rippleRect = ripple.getBoundingClientRect();
    
    let x = e.pageX - targetRect.left - (rippleRect.width / 2);
    let y = e.pageY - targetRect.top - window.scrollY - (rippleRect.height / 2);

    ripple.classList.remove('show');

    ripple.style.top = y + 'px';
    ripple.style.left = x + 'px';
    ripple.classList.add('show');
    return false;
  }
}

customElements.define(tag, CustomButtonElement);

export {
  CustomButtonElement,
  tag
}