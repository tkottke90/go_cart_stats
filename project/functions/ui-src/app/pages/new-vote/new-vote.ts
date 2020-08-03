import { html } from 'lit-html';
import styles from './new-vote.module.css'
// import { fromEvent } from 'rxjs';

import { User } from '../../classes/user.class';

import { Router } from '../../router';
import VotesService from '../../services/vote.service';
import UserService from '../../services/user.service';

import { PageComponent } from '../../components/page-component';
import FirebaseService from '../../services/firebase.service';
import '../../components/header/header-component';
import '../../components/custom-button/custom-button-component';
import { Votes } from '../../classes/votes.class';

const tag = 'new-vote-component'

class NewVoteComponent extends PageComponent {

  private isAdmin: boolean = false;
  private user: any = false;
  private dailyRecord: firebase.firestore.DocumentData = VotesService.DailyPlaceholder;
  private userList: User.Details[] = [];

  private daily: any;

  private selected: number = -1;

  onActivated() {
    this.daily = FirebaseService.$currentVotes()
    this.daily.onSnapshot({
      next: async (snapshot: firebase.firestore.DocumentSnapshot) => {
        console.dir(snapshot);
        this.dailyRecord = snapshot.data() || {};
        console.dir(this.dailyRecord)
        this.requestUpdate()
      }
    })

    this.user = UserService.$user.value;
    
    const _user = UserService.getUser() as firebase.User;
    _user
      .getIdTokenResult()
      .then( token => {
        this.isAdmin === !!token.claims.admin;
      })

    UserService
      .getAllUsers()
      .then((users: User.Details[]) => {
        this.userList = users;
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.error(error);
      }); 
  }

  render() {
    return html`
      <header-component>
        <custom-button slot="menu" color="on-primary" padding="0" @click=${this.navgiateToHome}>
          <svg slot="prefixIcon" style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
        </custom-button>
        <h3 slot="title">Dignity Shirt Voting</h3>
      </header-component>
      <main class="${styles.content}">
        <section class="${styles.todayVotes}">
          <h3><strong>Votes Cast Today:</strong> ${this.dailyRecord.count}</h3>
          <h3>Status: ${this.renderStatus()}</h3>
        </section>
        <section class="${styles.admin}">
          <custom-button
            label="Toggle Status"
          ></custom-button> 
        </section>
        <section class="${styles.myVotes}">
          <div class="${styles.overlay}"></div>
          <div class="${styles.buttonList}">
            ${this.userList.map( (user: User.Details, index: number) => {
              if (user.displayName === this.user.displayName) {
                return '';
              }

              return html`
                <button
                  @click=${this.setSelected(index)},
                  ?selected=${this.selected === index}
                >${user.displayName}</button>`;
            })}
          </div>
        </section>
      </main>
    `;
  }

  private setSelected(index: number){
    return async (event: Event) => {
      console.log(`Update: ${index}`);
      this.selected = index;
      this.requestUpdate();

      this.submit();
    }
  }
  
  private submit() {
    if (this.selected === -1) {
      return;
    }

    const ballot = this.userList[this.selected].displayName
    if (!ballot) {
      return;
    }

    const vote: Votes.Vote = {
      voter: this.user.id,
      ballot,
      date: new Date().valueOf()
    }

    VotesService.createVote(vote);
  }

  private renderStatus() {
    if (this.dailyRecord.open) {
    return html`<span class="${styles.status} ${styles['status--open']}" >Open</span>`;
    }

    return html`<span class="${styles.status} ${styles['status--closed']}">Closed</span>`;
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