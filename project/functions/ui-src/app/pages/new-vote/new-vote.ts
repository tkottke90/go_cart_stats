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

  private isAdmin: boolean = true;
  private user: any = false;
  private dailyRecord: any = VotesService.DailyPlaceholder;
  private userList: User.Details[] = [];

  private daily: any;

  private selected: number = -1;

  onActivated() {
    this.daily = FirebaseService.$currentVotes()
    this.daily.onSnapshot({
      next: async (snapshot: firebase.firestore.DocumentSnapshot) => {
        this.dailyRecord = snapshot.data() || false;
        this.requestUpdate()
      }
    })

    UserService
      .$user
      .subscribe( user => {
        if (!user) {
          Router.navigate('/login');
          UserService.logout();
          return;
        }

        this.user = user;
      });
    
    UserService.getUserDetails();
    const _user = UserService.getUser() as firebase.User;
    _user
      .getIdTokenResult()
      .then( token => {
        console.log(token);
        // this.isAdmin = !!token.claims.admin;
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
    if (this.dailyRecord && this.user) {
      const vote = this.dailyRecord.votes.findIndex( (item: any) => item.voter == this.user.id );
      if (vote !== -1) {
        this.selected = this.userList.findIndex( (item: any) => item.displayName === this.dailyRecord[vote].ballot )
      }
    }

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
          ${this.renderAdmin()}
        </section>
        <section class="${styles.myVotes}">
          <div class="${styles.overlay}" ?open=${!this.dailyRecord.open}>
            <h2>Voting Closed</h2>
            ${ this.dailyRecord.winner ? html`<h3>Winner: ${this.dailyRecord.winner}</h3>` : ''}
          </div>
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

    console.dir(this.user);

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

  private renderAdmin() {
    if (!this.isAdmin) {
      return html`<div>Not for Users</div>`;
    }

    if (!this.dailyRecord) {
      return html`<custom-button
        label="Start Voting"
        type="raised"
        color="primary"
        padding="0.5rem"
        @click=${VotesService.createDaily}
      ></custom-button>`
    }

    if (this.dailyRecord.open) {
      return html`
        <div class="${styles.adminOpen}">
          <section class="${styles.actions}">
            <custom-button
              label="Close Voting"
              type="raised"
              color="accent"
              padding="0.25rem"
              @click=${VotesService.toggleDaily}
            ></custom-button>
          </section>
          <section class="${styles.data}">
            <p><strong>Current Winner:</strong></p>
            <p>${this.dailyRecord.winner}</p>
          </section>
        </div>
      `;
    }

    return html`
      <div class="${styles.adminOpen}">
        <section class="${styles.actions}">
          <custom-button
            styles="font-weight: 600"
            label="Open Voting"
            type="raised"
            color="accent"
            padding="0.25rem"
            @click=${VotesService.toggleDaily}
          ></custom-button>
        </section>
        <section class="${styles.data}">
          <p><strong>Current Winner:</strong></p>
          <p>${this.dailyRecord.winner}</p>
        </section>
      </div>
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