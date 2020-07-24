import { html } from 'lit-html';
import styles from './login.module.css'
import { fromEvent } from 'rxjs';

import UserService from '../../services/user.service';

import { PageComponent } from '../../components/page-component';

const tag = 'login-component';

class LoginElement extends PageComponent {

  private disableBtns = false;

  firstUpdated() {
    const form = this.querySelector('form') as HTMLElement;
    const formSubmit = fromEvent(form, 'submit');

    formSubmit.subscribe( async (event: any) => {
      event.preventDefault();

      const submitter = event.submitter as HTMLElement;
      
      if (submitter.dataset.type === 'google') {

        return;
      }
      
      
      const elements = Array.from(event.target.elements as HTMLFormControlsCollection);
      
      const formData: any = elements
                        .filter( (item: any) => !!item.name )
                        .reduce( (data: any, element: any) => Object.assign(data, { [element.name]: element.value }), {})

      try {
        this.disableBtns = true;
        this.requestUpdate();
        const result = await UserService.login(formData.username, formData.password)
        console.dir(result);
        if (result.user){
         console.dir(await result.user.getIdToken());
        } else {
          console.log('no user');
        }
        
        const session = await UserService.getSession();
        if (session) {
          console.dir(await session.json());
        }
      } catch (err) {
        console.error(err);
        elements.forEach( (element: Element) => {
          element.classList.toggle('invalid');
        });
      }
      this.disableBtns = false;
      this.requestUpdate();
    });

    const inputs = this.querySelectorAll('input');
    inputs.forEach( (input: HTMLInputElement) => {
      fromEvent(input, 'input')
        .subscribe( (event) => {
          const hasError = input.classList.contains('invalid');

          if (hasError) {
            input.classList.toggle('invalid');
          }
        });
    })
  }

  render() {
    return html`
    <main class=${styles.loginContainer}>
      <section class=${styles.title}>
        <h2>Carousel Karters</h2>
      </section> 
      <form>
        <input name="username" type="email" />
        <input name="password" type="password" />
        <button class=${styles.loginBtn} data-type="local" ?disabled=${this.disableBtns}>Login</button>
        <br>
        <button class=${styles.googleBtn} data-type="google" ?disabled=${this.disableBtns}>
          <svg viewBox="0 0 46 46">
            <g id="logo_googleg_48dp" sketch:type="MSLayerGroup" transform="translate(15.000000, 15.000000)">
              <path d="M17.64,9.20454545 C17.64,8.56636364 17.5827273,7.95272727 17.4763636,7.36363636 L9,7.36363636 L9,10.845 L13.8436364,10.845 C13.635,11.97 13.0009091,12.9231818 12.0477273,13.5613636 L12.0477273,15.8195455 L14.9563636,15.8195455 C16.6581818,14.2527273 17.64,11.9454545 17.64,9.20454545 L17.64,9.20454545 Z" id="Shape" fill="#4285F4" sketch:type="MSShapeGroup"></path>
              <path d="M9,18 C11.43,18 13.4672727,17.1940909 14.9563636,15.8195455 L12.0477273,13.5613636 C11.2418182,14.1013636 10.2109091,14.4204545 9,14.4204545 C6.65590909,14.4204545 4.67181818,12.8372727 3.96409091,10.71 L0.957272727,10.71 L0.957272727,13.0418182 C2.43818182,15.9831818 5.48181818,18 9,18 L9,18 Z" id="Shape" fill="#34A853" sketch:type="MSShapeGroup"></path>
              <path d="M3.96409091,10.71 C3.78409091,10.17 3.68181818,9.59318182 3.68181818,9 C3.68181818,8.40681818 3.78409091,7.83 3.96409091,7.29 L3.96409091,4.95818182 L0.957272727,4.95818182 C0.347727273,6.17318182 0,7.54772727 0,9 C0,10.4522727 0.347727273,11.8268182 0.957272727,13.0418182 L3.96409091,10.71 L3.96409091,10.71 Z" id="Shape" fill="#FBBC05" sketch:type="MSShapeGroup"></path>
              <path d="M9,3.57954545 C10.3213636,3.57954545 11.5077273,4.03363636 12.4404545,4.92545455 L15.0218182,2.34409091 C13.4631818,0.891818182 11.4259091,0 9,0 C5.48181818,0 2.43818182,2.01681818 0.957272727,4.95818182 L3.96409091,7.29 C4.67181818,5.16272727 6.65590909,3.57954545 9,3.57954545 L9,3.57954545 Z" id="Shape" fill="#EA4335" sketch:type="MSShapeGroup"></path>
            </g>
          </svg>
          <span>Sign In With Google</span>
        </button>
      </form>
    </main>
    `
  }
}

customElements.define(tag, LoginElement);

export {
  LoginElement,
  tag
};