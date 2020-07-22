import { html } from 'lit-html';
// import styles from './home.module.css'

import { PageComponent } from '../../components/page-component';

import '../../components/header/header-component';

const tag = 'home-component';

class HomeElement extends PageComponent {
  render() {
    return html`
     <header-component>
      <h3 slot="title">Carousel Karters</h3>
     </header-component>
    `
  }
}

customElements.define(tag, HomeElement);

export {
  HomeElement,
  tag
};