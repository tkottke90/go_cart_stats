import { html } from 'lit-html';
// import styles from './home.module.css'

import { PageComponent } from '../../components/page-component';

const tag = 'login-component';

class LoginElement extends PageComponent {
  render() {
    return html`
     <form>
       <input name="username" />
     </form>
    `
  }
}

customElements.define(tag, LoginElement);

export {
  LoginElement,
  tag
};