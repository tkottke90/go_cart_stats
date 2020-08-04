import { render, html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { getRoutes, routes } from '../bootstrap.routes';
import { Router } from './router';
import { Route } from './util/route';
import { BaseComponent } from './components/base-component';
import { fromEvent } from 'rxjs';

import './util/router-outlet';

const pages = getRoutes(routes)

class AppComponent extends BaseComponent {

  private theme: string;

  constructor() {
    super();

    const _theme = window.localStorage.getItem('theme');
    const _userTheme = window.matchMedia('(prefers-color-scheme: dark)');

    fromEvent(_userTheme, 'change')
      .subscribe( (event: any) => {
        const newTheme = event.matches ? 'dark' : 'light';
        this.theme = newTheme;
        window.localStorage.setItem('theme', newTheme);
      })

    if (_theme === 'light' || _theme === 'dark') {
      this.theme = _theme;
    } else if (_userTheme.matches) {
      this.theme = 'dark';
      window.localStorage.setItem('theme', 'dark');
    } else {
      this.theme = 'light';
      window.localStorage.setItem('theme', 'light');
    }
  }

  getTag(route: Route) {
    const tag = route.tag;
    const classes = ['page'];
    const path = Router.currentLocation ? Router.currentLocation.pathname : false;
    if (path === route.path) {
      classes.push('active');
    }

    return unsafeHTML(`<${tag} class="${classes.join(' ')}"></${tag}>`);
  }

  render() {
    document.body.setAttribute('theme', this.theme);

    return html`
      <style>
        .page {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          opacity: 0;
          pointer-events: none;
          overflow: hidden;
          display: block;
          max-height: 100%;
          transform: scale(.99,.99) translate(0, -.2rem);
          transition: 200ms var(--accelerate-bezier);
          transition-property: opacity, transform;
          transform-origin: top center;
        }
        
        .page.active {
          z-index: 1;
          opacity: 1;
          pointer-events: all;
          position: relative;
          overflow: visible;
          height: 100%;
          width: 100%;
          transform: none;
        }

        .alpha {
          position: fixed;
          height: 2rem;
          bottom: 0;
          left: 0;
          right: 0;
          top: calc(100vh - 2rem);

          z-index: 100;
          background: var(--theme-warn);
          color: var(--theme-on-warn);
          padding: 0.5rem;
          text-align: center;
        }
      </style>
        ${pages.map((route) => this.getTag(route))
          .map((route) => html`${route}`)}

        <h3 class="alpha">Alpha</h3>
    `;
  }
}

customElements.define('app-root', AppComponent);

render(html`<app-root></app-root>`, document.body);