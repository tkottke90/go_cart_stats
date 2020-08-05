import { property } from 'lit-element';
import { html } from 'lit-html';
import { BaseComponent } from '../base-component';
import styles from './loading-spinner.module.scss';

const tag = 'loading-spinner';

class LoadingElement extends BaseComponent {

  @property({ type: Number }) diameter: number = 24;

  render() {
    return html`
      <div class="${styles.loaderContainer}" style="width: ${this.diameter}px; height: ${this.diameter}px; margin: ${this.diameter / 2}px calc(50% - ${this.diameter}px);">
        <div class="${styles.loader}"></div>
      </div>
    `;
  }
}

customElements.define(tag, LoadingElement);

export {
  tag,
  LoadingElement
};