import HTTPService from './http.service';
import { BehaviorSubject }  from 'rxjs';

import { Races } from '../classes/races.class';

export default class RaceService {

  private static baseUrl = '/races';

  public static RacePlaceholder: Races.Entry = {
    userId: '',
    cartNumber: '',
    totalTime: '',
    date: 0,
    bestTime: '',
    laps: []
  }

  public static races: BehaviorSubject<Races.Entry[]> = new BehaviorSubject<Races.Entry[]>([]);

  public static getRace(id: string) {
    return HTTPService.get(`${this.baseUrl}/${id}`).toPromise();
  }

  public static createRace(data: any) {
    return HTTPService.post(`${this.baseUrl}/create`, data).toPromise();
  }

  public static findRaces(query: any) {
    return new Promise( async (resolve, reject) => {
      const result = await HTTPService.post(this.baseUrl, query).toPromise();

      if (result.status !== 200) {
        reject();
      }

      this.races.next(await result.json());
      resolve();
    });
  }
}