import { html, TemplateResult } from 'lit-html';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg'
import styles from './new-race.module.css'
import { fromEvent } from 'rxjs';

declare var Tesseract: any;

import UserService from '../../services/user.service';
import TrackService from '../../services/track.service';
import RaceService from '../../services/race.service';

import { User } from '../../classes/user.class';
import { Tracks } from '../../classes/track.class';
import { Races } from '../../classes/races.class';

import { Router } from '../../router';

import { PageComponent } from '../../components/page-component';
import '../../components/header/header-component';
import '../../components/custom-button/custom-button-component';
import '../../components/dialog/dialog';
import formHelper from '../../util/form-helper';

const totalRegex = /\s([0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}\.[0-9]{1,2})/;
const lapRegex = /([0-9]{2})\s([0-9]{1,2}:?[0-9]{1,2}\.?[0-9]{1,2})\s?([0-9]?)(BL)?/;

const tag = 'new-race-component';

class NewRaceComponent extends PageComponent {

  private loading = false;
  private dialogContent: TemplateResult = html``;
  private user: User.Details = UserService.UserPlaceholder;
  private tracks: Tracks.Track[] = [ TrackService.TrackPlaceholder ];

  private time: string = '';
  private totalTime = '';
  private laps: Races.Lap[] = [
    { time: '', bestLap: false, position: '' }
  ];

  private worker: any;

  constructor() {
    super();

    this.worker = Tesseract.createWorker({
      workerPath: 'https://unpkg.com/tesseract.js@v2.0.0/dist/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      corePath: 'https://unpkg.com/tesseract.js-core@v2.0.0/tesseract-core.wasm.js',
      logger: (m: any) => {
        const statusMessage: { [key: string]: string } = {
          "loading tesseract core": "Loading Module",
          "initializing tesseract": "Initializing",
          "loading language traineddata": "Loading Configurations",
          "initializing api": "Warming Up",
          "recognizing text": "Scanning"
        }

        const message = statusMessage[m.status] || 'Loading';
        const percentage = Math.floor(m.progress * 100);
        const progress = message === 'Scanning' ? html` <span>${percentage}%</span>` : '';

        this.dialogContent = html`
          <h3 slot="header" class="${styles.scanningHeader}">Scanning Image</h3>
          <div class="${styles.scanningBody} ${styles.pulse}">
            <h4>${message}${progress}</h4>
          </div>
        `

        this.requestUpdate();
      }
    });
  }

  async firstUpdated() {
    UserService.$user.subscribe( user => {
      if (!user) {
        Router.navigate('/login');
      }

      this.user = user;
      this.requestUpdate();
    });

    TrackService.$tracks.subscribe( track => {
      if (!track) {
        this.tracks = [ TrackService.TrackPlaceholder ];
      }

      this.tracks = track;
      this.requestUpdate();
    });

    await UserService.getUserDetails();
    await TrackService.findTrack({});

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

  onActivated() {
    this.reset();
    this.requestUpdate()
    return;
  }

  generateLapRow(time: string = '', bestLap: boolean = false, position: string = '', index: number = -1) {
    return html`
      <div class="${styles.lapRow}"  @input=${this.updateLap}>
        <input
          class="${styles.posCol}"
          name="position"
          type="number"
          value=${position}
          placeholder="5"
          data-lapIndex="${index}"
          @invalid=${formHelper.markInputInvalid}
          @input=${formHelper.markInputAsValid}
        />

        <input 
          class="${styles.timeCol}"
          name="time"
          type="text"
          pattern="[0-9]{1,2}:[0-9]{1,2}\.?[0-9]{1,3}"
          value="${time}"
          placeholder="00:45.765"
          data-lapIndex="${index}"
          @invalid=${formHelper.markInputInvalid}
          @input=${formHelper.markInputAsValid}
        />

        <input
          class="${styles.blCol}"
          name="bestLap"
          type="checkbox"
          ?checked=${bestLap}
          data-lapIndex="${index}"
        />

        <custom-button
          class="${styles.rmBtn}"
          ?disabled=${index === -1}
          data-lapIndex="${index}"
          padding="0"
          @click=${this.removeLap}
        >
          <svg slot="prefixIcon" style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </custom-button>
      </div>
    `;
  }

  render() {
    const time = this.time || this.getCurrentDateTime();
    this.time = time;

    return html`
     <header-component>
      <custom-button slot="menu" color="on-primary" padding="0" @click=${this.navgiateToHome}>
        <svg slot="prefixIcon" style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
        </svg>
      </custom-button>
      <h3 slot="title">Add New Race</h3>
     </header-component>
     <main class="${styles.content}">
      <form action="" id="new-user-form" class="${styles.inputs}">
        <input
          name="date"
          placeholder="Timestamp",
          autocomplete="now"
          type="datetime-local"
          value="${time}"
          class="${styles.dateInput}"
        />

        <div class="${styles.overall}">
          <input 
            type="number"
            name="cartNumber"
            placeholder="Cart"
            min="0"
            length="3"
            required
          />

          <input 
            type="text"
            name="totalTime"
            placeholder="Total Time"
            value="${this.totalTime}"
            pattern="[0-9]{0,2}:?[0-9]{1,2}:[0-9]{1,2}\.?[0-9]{1,3}"
            required
          />
        </div>

        <div class="${styles.trackList}">
          ${this.tracks.map( track => {
            return html`
              <button class="${styles.trackButton}" data-name="${track.name}">
                ${ unsafeSVG(track.thumbnail) }
              </button>
            `
          })}
        </div>

        <div id="lap-times">
          <div class="${styles.lapRow}">
            <p class="${styles.header} ${styles.posCol}" >Position</p>
            <p class="${styles.header} ${styles.timeCol}" >Lap Time</p>
            <p class="${styles.header} ${styles.blCol}" >Best Lap</p>
            <p class="${styles.rmBtn}"></p>
          </div>
          ${this.laps.map( (lap: Races.Lap, index: number) => this.generateLapRow(lap.time, lap.bestLap, lap.position, index) )}
          <div class=${styles.lapRow}>
            <custom-button
              label="Add Lap"
              type="raised"
              color="primary"
              align="center"
              padding="0.5rem"
              @click=${this.addLap}
            >
              <svg slot="prefixIcon" style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            </custom-button>
          </div>
        </div>

          <div class="${styles.actions}">
            <custom-button
            label="Scan"
            type="outline"
            padding="0.5rem"
            @click=${this.scanImage}
            .disabled=${this.loading}
            >
              <svg slot="suffixIcon" style="width:24px;height:24px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17,22V20H20V17H22V20.5C22,20.89 21.84,21.24 21.54,21.54C21.24,21.84 20.89,22 20.5,22H17M7,22H3.5C3.11,22 2.76,21.84 2.46,21.54C2.16,21.24 2,20.89 2,20.5V17H4V20H7V22M17,2H20.5C20.89,2 21.24,2.16 21.54,2.46C21.84,2.76 22,3.11 22,3.5V7H20V4H17V2M7,2V4H4V7H2V3.5C2,3.11 2.16,2.76 2.46,2.46C2.76,2.16 3.11,2 3.5,2H7M13,17.25L17,14.95V10.36L13,12.66V17.25M12,10.92L16,8.63L12,6.28L8,8.63L12,10.92M7,14.95L11,17.25V12.66L7,10.36V14.95M18.23,7.59C18.73,7.91 19,8.34 19,8.91V15.23C19,15.8 18.73,16.23 18.23,16.55L12.75,19.73C12.25,20.05 11.75,20.05 11.25,19.73L5.77,16.55C5.27,16.23 5,15.8 5,15.23V8.91C5,8.34 5.27,7.91 5.77,7.59L11.25,4.41C11.5,4.28 11.75,4.22 12,4.22C12.25,4.22 12.5,4.28 12.75,4.41L18.23,7.59Z" />
              </svg>
            </custom-button>
            <custom-button
            .disabled=${this.loading}
            type="raised"
            label="Submit"
            padding="0.5rem"
            @click=${this.submit}
            class="${styles.submitBtn}"
            ></custom-button>
          </div>
        </form>
        <dialog-component ?open=${this.loading}>
          ${this.dialogContent}
        </dialog-component>
     </main>
    `
  }

  private addLap(event: Event) {
    this.laps.push({
      position: '',
      time: '',
      bestLap: false
    });
    this.requestUpdate()
  }

  private updateLap(event: Event) {
    const target = event.target as HTMLInputElement;
    const index = target.dataset.lapindex as string;

    if (parseInt(index) === -1) {
      return;
    }

    const i = parseInt(index);

    this.laps[i] = Object.assign(this.laps[i], formHelper.getValue(target));
  }

  private removeLap(event: Event) {
    const target = event.target as HTMLInputElement;
    const lapIndex = target.dataset.lapindex as string;

    this.laps.splice(parseInt(lapIndex), 1);
    this.requestUpdate();
  }

  private scanImage(event: Event) {
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');

    fromEvent(input, 'change')
      .subscribe( async (event: Event) => {
        this.loading = true;
        this.requestUpdate();

        // Get Image
        const target = event.target as HTMLInputElement;
        const files = target.files as FileList;

        if (files.length === 0) {
          return;
        }

        const file = files[0] as File;

        // Create Worker
        await this.worker.load();
        await this.worker.loadLanguage('eng');
        await this.worker.initialize('eng');
        const result = await this.worker.recognize(file);

        // Review results
        const { data: { lines } } = result;

        lines.forEach( (line: any) => {

          const totalPart = line.text.match(totalRegex);
          const lineParts = line.text.match(lapRegex);
          if (!lineParts) {
            return;
          }

          const time = lineParts[2];
          const position = lineParts[3];
          const bestLap = !!lineParts[4];

          if (totalPart) {
            this.totalTime = totalPart[0].trim();
          }

          // Remove laps list is a single record with no time, remove it
          if(this.laps.length === 1 && !this.laps[0].time){
            this.laps.pop();
          }

          this.laps.push({
            time,
            position,
            bestLap
          })
        });

        this.loading = false;
        this.requestUpdate();
      });
  
    input.click();
  }

  private async submit(event: Event) {
    const form = this.querySelector('form') as HTMLFormElement;
    const elements = Array.from(form.elements) as HTMLElement[];
    const formData: any = elements
                        .filter( (item: any) => !!item.name && !['bestLap', 'position', 'time'].includes(item.name) )
                        .reduce( (data: any, element: any) => Object.assign(data, formHelper.getValue(element)), {})

    const valid = formHelper.isValidFromElement(form);

    const bestTime = this.laps.find( item => item.bestLap );
    const data: Races.Entry = {
      userId: this.user.id,
      date: new Date(formData.date).valueOf(),
      cartNumber: formData.cartNumber,
      totalTime: formData.totalTime,
      bestTime: bestTime ? bestTime.time : 'N/A',
      laps: this.laps,
      invalid: false
    }


    if (valid) {
      this.loading = true;
      this.dialogContent = html`
        <h3 slot="header" class="${styles.scanningHeader}">Saving Race</h3>
        <div class="${styles.scanningBody} ${styles.pulse}">
          <h4>Submitting Race Details</h4>
        </div>
      `;
      this.requestUpdate();

      try {
        await RaceService.createRace(data)
      } catch(error) {
        console.error(error);
        this.loading = false;
        this.requestUpdate();

        // TODO - Add Snackbar Notification Of Failure
      }

      this.dialogContent = html`
        <h3 slot="header" class="${styles.scanningHeader}">Saving Race</h3>
        <div class="${styles.scanningBody}">
          <h4>Success!</h4>
        </div>
      `;
      this.requestUpdate();

      setTimeout(() => {
        this.loading = false;
        this.reset();
        this.requestUpdate();
      }, 2000);
      // TODO - Add Snackbar Notification of Success

      // Router.navigate('/');
    } else {
      const invalidFields = elements.map((e: HTMLElement) => {
        const valid = formHelper.getValidity(e);
        if (valid) {
          return false;
        }
        const elem = e as HTMLInputElement;

        return { name: elem.name, validity: elem.validationMessage }
      }).filter( response => response );

      this.dialogContent = html`
        <h3 slot="header" class="${styles.scanningHeader}">Saving Race</h3>
        <div class="${styles.scanningBodyErrors} ">
          <h4>Issues Found (${invalidFields.length}):</h4>
          <ul>
            ${invalidFields.map((item: any) => html`<li>${item.name}: ${item.validity}</li>`)}
          </ul>
        </div>
        <div slot="actions">
          <custom-button padding="0.5rem" label="close" color="primary" type="raised" @click=${this.closeLoading}></custom-button>
        </div>
      `;
      this.requestUpdate();

      console.error('Invalid Form Submittion');
    }
  }

  private getCurrentDateTime() {
    const $date = new Date();
    
    const year = $date.getFullYear();
    const month = formHelper.leadingZeroString($date.getMonth() + 1)
    const date = formHelper.leadingZeroString($date.getDate());
    const hour = formHelper.leadingZeroString($date.getHours());
    const min = formHelper.leadingZeroString($date.getMinutes());

    return `${year}-${month}-${date}T${hour}:${min}`;
  }

  private navgiateToHome() {
    Router.navigate('/');
  }

  private closeLoading() {
    this.loading = false;
    this.requestUpdate();
  }

  private reset() {
    const form = this.querySelector('form') as HTMLFormElement;
    form.reset();

    this.totalTime = '';
    this.laps = [ { time: '', position: '', bestLap: false } ]
    this.dialogContent = html``;
  }
}

customElements.define(tag, NewRaceComponent);

export {
  NewRaceComponent,
  tag
};