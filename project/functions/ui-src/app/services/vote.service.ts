import HTTPService from './http.service';
import { BehaviorSubject }  from 'rxjs';

import { Votes } from '../classes/votes.class';

export default class VoteService {

  private static baseUrl = '/votes';

  public static VotesPlaceholder: Votes.Vote = {
    userId: '',
    ballot: '',
    date: '',
  }

  public static votes: BehaviorSubject<Votes.Vote[]> = new BehaviorSubject<Votes.Vote[]>([]);

  public static getVote(id: string) {
    return HTTPService.get(`${this.baseUrl}/${id}`).toPromise();
  }

  public static createVote(data: any) {
    return HTTPService.post(`${this.baseUrl}`, data).toPromise();
  }

  public static findVotes(query: any) {
    return new Promise( async (resolve, reject) => {
      const result = await HTTPService.post(this.baseUrl, query).toPromise();

      if (result.status !== 200) {
        reject();
      }

      this.votes.next(await result.json());
      resolve();
    });
  }
}