import { html } from 'lit-html';
import styles from './new-user.module.css'

import UserService from '../../services/user.service';
import { User } from '../../classes/user.class';

import { Router } from '../../router';

import { PageComponent } from '../../components/page-component';
import '../../components/header/header-component';
import '../../components/custom-button/custom-button-component';
import formHelper from '../../util/form-helper';
import { fromEvent } from 'rxjs';


const tag = 'new-user-component';

class NewUserComponent extends PageComponent {

  private loading = false;
  private user: User.Details = UserService.UserPlaceholder;
  private drivers: User.Details[] = [];

  async firstUpdated() {
    UserService.$user.subscribe( user => {
      if (!user) {
        Router.navigate('/login');
      }

      this.user = user;
      this.requestUpdate();
    });

    await UserService.getUserDetails();
    const driverList = await UserService.getAllUsers()

    this.drivers = driverList.filter( (driver: User.Details) => driver.id !== this.user.id );
    this.requestUpdate();

    const inputs = this.querySelectorAll('input');
    inputs.forEach( input => {
      fromEvent(input, 'invalid')
        .subscribe( (event: any) => {
          const target = event.target as HTMLInputElement;
          target.setAttribute('invalid', '');
        })

      fromEvent(input, 'input')
        .subscribe( (event: any) => {
          const target = event.target as HTMLInputElement;
          target.removeAttribute('invalid');
        });

      if (input.required) {
        input.placeholder = `${input.placeholder}*`;
      }
    });
  }

  render() {
    return html`
     <header-component>
      <h3 slot="title">Carousel Karters</h3>
     </header-component>
     <main class="${styles.content}">
      <h2 class=${styles.title}>Welcome Racer!</h2>
      <p>Lets get started with some information about you</p>

      <form action="" id="new-user-form" class="${styles.inputs}">
        <input
          name="displayName"
          placeholder="Display Name",
          autocomplete="name"
          type="text"
          required
        />
        <input 
          type="number"
          name="number"
          placeholder="Driver Number"
          min="0"
          required
        />
        <input
          name="nickname"
          placeholder="Nickname"
          autocomplete="nickname"
          type="text"
        />
        <input
          name="experience"
          type="number"
          min="0"
          placeholder="Experience (Years)"
          required
        />

        <select
          name="rival"
          placeholder="Rival"
          type="text"
        >
          <option value="">None</option>
          ${ this.drivers
                  .map( driver => {
                      return html`<option value="${driver.displayName}">${driver.displayName ? driver.displayName : driver.email}</option> `
                    })}
        </select>

          <custom-button
            .disabled=${this.loading}
            type="raised"
            label="Submit"
            padding="0.5rem"
            @click=${this.submit}
            class="${styles.submitBtn}"
          ></custom-button>
      </form>
     </main>
    `
  }

  private async submit(event: Event) {
    const form = this.querySelector('form') as HTMLFormElement;
    const elements = Array.from(form.elements) as HTMLElement[];
    const formData: any = elements
                        .filter( (item: any) => !!item.name )
                        .reduce( (data: any, element: any) => Object.assign(data, formHelper.getValue(element)), {})

    const valid = formHelper.isValidFromElement(form);


    if (valid) {
      this.loading = true;
      this.requestUpdate();

      const userInfo = Object.assign(this.user, formData, { new: false });

      try {
        await UserService.setUserDetails(userInfo);
      } catch(error) {
        console.error(error);
        this.loading = false;
        this.requestUpdate();

        // TODO - Add Snackbar Notification Of Failure
      }

      this.loading = false;
      this.requestUpdate();
      // TODO - Add Snackbar Notification of Success

      Router.navigate('/');
    } else {
      console.error('Invalid Form Submittion');
    }
  }
}

customElements.define(tag, NewUserComponent);

export {
  NewUserComponent,
  tag
};