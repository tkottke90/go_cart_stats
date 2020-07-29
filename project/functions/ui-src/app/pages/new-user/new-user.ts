import { html } from 'lit-html';
import styles from './new-user.module.css'
// import UserService from '../../services/user.service';
// import { Router } from '../../router';

import { PageComponent } from '../../components/page-component';
import '../../components/header/header-component';

const tag = 'new-user-component';

class NewUserComponent extends PageComponent {

  render() {
    return html`
     <header-component>
      <h3 slot="title">Carousel Karters</h3>
     </header-component>
     <main class="${styles.content}">
      <h2 class=${styles.title}>Welcome Racer!</h2>
      <p>Lets get started with some information about you</p>

      <form action="" class="${styles.inputs}">
        <input
          name="display"
          placeholder="Display Name"
        />
        <input 
          name="number"
          placeholder="Number"
        />
        <input
          name="nickname"
          placeholder="Nickname"
        />
      </form>
     </main>
    `
  }

  // private submit() {
  //   console.log('submit');
  // }
}

customElements.define(tag, NewUserComponent);

export {
  NewUserComponent,
  tag
};