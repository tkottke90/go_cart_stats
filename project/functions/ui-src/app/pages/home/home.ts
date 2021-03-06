import { html } from 'lit-html';
import styles from './home.module.css'
import UserService from '../../services/user.service';
import { Router } from '../../router';

import { PageComponent } from '../../components/page-component';
import '@material/mwc-drawer'
import '../../components/header/header-component';
import '../../components/custom-button/custom-button-component';

import RaceService from '../../services/race.service';
import VoteService from '../../services/vote.service';

import { Races } from '../../classes/races.class';
import { Votes } from '../../classes/votes.class';
import { User } from '../../classes/user.class';

const tag = 'home-component';

class HomeElement extends PageComponent {

  private loading = true;
  private showDrawer = false;
  private user: User.Details = UserService.UserPlaceholder;

  private races: Races.Entry[] = [
    RaceService.RacePlaceholder,
    RaceService.RacePlaceholder,
    RaceService.RacePlaceholder
  ];

  private votes: Votes.Vote[] = [
    VoteService.VotesPlaceholder,
    VoteService.VotesPlaceholder,
    VoteService.VotesPlaceholder
  ];

  firstUpdated() {
    RaceService.races.subscribe( races => {
      this.races = races;
      this.requestUpdate();
    })
    RaceService.findRaces({ userId: this.user.id });

    VoteService.votes.subscribe( votes => {
      this.votes = votes
      this.requestUpdate();
    });
    VoteService.findVotes({ userId: this.user.id });
  }

  onActivated() {
    this.showDrawer = false;
    UserService.$user.subscribe( user => {
      if (!user) {
        UserService.logout();
        Router.navigate('/login');
      }

      this.user = user;
    });
    
    UserService
    .getUserDetails()
    .then( async user => {
      this.user = user;

      if (user.new) {
        Router.navigate('/new-user');
      }

      VoteService.findVotes({ voter: user.id, invalid: false });
      RaceService.findRaces({ userId: this.user.id, invalid: false });

      this.loading = false;
      this.requestUpdate();
    })
    .catch( error => {
      console.error(error);
      Router.navigate('/login');
    });
    this.requestUpdate();
  }

  generateRaceTable() {
    let raceArr = [];
    if (this.races.length >= 3) {
      raceArr = this.races.slice(0, 3);
    } else {
      raceArr = this.races;
      const placeholderCount = 3 - raceArr.length;
      const placeholderArr = new Array(placeholderCount).fill(RaceService.RacePlaceholder);
      
      raceArr = raceArr.concat(placeholderArr);
    }

    return html`
    <div id="race-table" class="${styles.tableData}">
      <header class="${styles.tableHeader}">
        <h4 class="${styles.dateCol}">Date</h4>
        <h4 class="${styles.timeCol}">Time</h4>
        <h4 class="${styles.bestCol}">Fast Lap</h4>
      </header>
      <section class="${styles.tableBody}">
        ${ raceArr.map( (race: Races.Entry) => {
          const date = new Date(race.date);
          let dateString = '00';
          if (race.date) {
            dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          }

          return html`
          <div class="${styles.tableRow}" ?invisible=${dateString === '00'}>
            <span class="${styles.dateCol}">${dateString}</span>
            <span class="${styles.timeCol}">${race.totalTime}</span>
            <span class="${styles.bestCol}">${race.bestTime}</span>
          </div>
        `})}
      </section>
    </div>
    `;
  }

  generateVotesTable() {
    let voteArr = [];
    if (this.votes.length >= 3) {
      voteArr = this.votes.slice(0, 3);
    } else {
      voteArr = this.votes;
      const placeholderCount = 3 - voteArr.length;
      const placeholderArr = new Array(placeholderCount).fill(VoteService.VotesPlaceholder);
      
      voteArr = voteArr.concat(placeholderArr);
    }

    return html`
    <div id="votes-table" class="${styles.tableData}">
      <header class="${styles.tableHeader}">
        <h4 class="${styles.dateCol}">Date</h4>
        <h4 class="${styles.voteCol}">Vote</h4>
      </header>
      <section class="${styles.tableBody}">
        ${ voteArr.map( (vote: Votes.Vote) => {
          const date = new Date(vote.date);
          let dateString = '00';
          if (vote.date) {
            dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          }

          return html`
          <div class="${styles.tableRow}" ?invisible=${dateString === '00'}>
            <span class="${styles.dateCol}">${dateString}</span>
            <span class="${styles.voteCol}">${vote.ballot}</span>
          </div>
        `})}
      </section>
    </div>
    `;
  }

  render() {

    return html`
     <mwc-drawer type="modal" ?open=${this.showDrawer} @closed=${this.toggleDrawer}>
        <custom-button label="logout" padding="0.5rem" @click=${this.logout}>
          <svg style="width:24px;height:24px" slot="prefixIcon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
          </svg>
        </custom-button>
        <div slot="appContent">
          ${this.renderMain()}
        </div>
     </mwc-drawer>
    `
  }

  private renderMain() {
    return html`
      <header-component>
        <h3 slot="title">Carousel Karters</h3>
        <custom-button
          slot="menu"
          color="on-primary"
          padding="0"
          @click=${this.toggleDrawer}
        >
          <svg slot="prefixIcon" style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
          </svg>
        </custom-button>
      </header-component>
      <main class="${styles.content}">
      <section class="${styles.info}">
        <h3 class=${styles.number}>${this.user.number}</h3>
        <div class=${styles.detail}>
          <h3 class="${styles.name}" text-ellipsis>${this.user.displayName ? this.user.displayName : this.user.email }</h3>
          ${this.user.nickname ? html`<h5 class="${styles.nname}" text-ellipsis >${this.user.nickname ? this.user.nickname : ''}</h5>` : ''}
          <h4 class="${styles.exp}">Experience: ${this.user.experience} Years</h4>
          ${ this.user.rival ? html`<h4 class="${styles.rival}">Rival: Joe Kottke</h4>` : '' }
        </div>
      </section>
      <section class="${styles.actions}">
        <custom-button padding="0.25rem" type="raised" label="Add Race" @click=${this.navigateToNewRace}></custom-button>
        <custom-button padding="0.25rem" type="raised" label="Voting" @click=${this.navigateToNewVote}></custom-button>
      </section>
      <section class="${styles.races} ${styles.table}">
        <h4 class="${styles.tableTitle}">Recent Races</h4>
        <custom-button class=${styles.tableBtn} padding="0.25rem" type="raised" label="My Races" disabled></custom-button>
        ${this.generateRaceTable()}
      </section>
      <section class="${styles.votes} ${styles.table}">
        <h4 class="${styles.tableTitle}">Recent Voting</h4>
        <custom-button class=${styles.tableBtn} padding="0.25rem" type="raised" label="My Votes" disabled></custom-button>
        ${this.generateVotesTable()}
      </section>
      </main>
      <section class="${styles.loadingContainer}" ?hidden=${!this.loading} >
      <h2>Loading...</h2>
      </section>
    `;
  }

  private toggleDrawer() {
    this.showDrawer = !this.showDrawer;
    this.requestUpdate();
  }

  private navigateToNewRace() {
    Router.navigate('/new-race');
  }

  private navigateToNewVote() {
    Router.navigate('/new-vote');
  }

  private logout() {
    this.showDrawer = false;

    UserService.logout();
    Router.navigate('/login');
    this.requestUpdate();
  }
}

customElements.define(tag, HomeElement);

export {
  HomeElement,
  tag
};