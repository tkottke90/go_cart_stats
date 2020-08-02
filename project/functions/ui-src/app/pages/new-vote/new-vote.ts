import { html } from 'lit-html';
// import styles from './new-race.module.css'
// import { fromEvent } from 'rxjs';

import { Router } from '../../router';

import { PageComponent } from '../../components/page-component';
import '../../components/header/header-component';
import '../../components/custom-button/custom-button-component';

const tag = 'new-vote-component'

class NewVoteComponent extends PageComponent {

  render() {
    return html`
      <header-component>
        <custom-button slot="menu" color="on-primary" padding="0" @click=${this.navgiateToHome}>
          <svg slot="prefixIcon" style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
        </custom-button>
        <h3 slot="title">Add New Race</h3>
      </header-component>
      <main></main>
    `;
  }

  private navgiateToHome() {
    Router.navigate('/');
  }
}

customElements.define(tag, NewVoteComponent);

export {
  NewVoteComponent,
  tag
}