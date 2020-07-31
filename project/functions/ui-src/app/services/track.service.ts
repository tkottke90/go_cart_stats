import HTTPService from './http.service';
import { BehaviorSubject }  from 'rxjs';

import { Tracks } from '../classes/track.class';

export default class TrackService {

  private static baseUrl = '/tracks';

  public static TrackPlaceholder: Tracks.Track = {
    name: '',
    thumbnail: ''
  }

  public static $tracks: BehaviorSubject<Tracks.Track[]> = new BehaviorSubject<Tracks.Track[]>([]);

  public static getTrack(id: string) {
    return HTTPService.get(`${this.baseUrl}/${id}`).toPromise();
  }

  public static createTrack(data: any) {
    return HTTPService.post(`${this.baseUrl}/create`, data).toPromise();
  }

  public static findTrack(query: any) {
    return new Promise( async (resolve, reject) => {
      const result = await HTTPService.post(this.baseUrl, query).toPromise();

      if (result.status !== 200) {
        reject();
      }

      const data = await result.json();

      this.$tracks.next(data);
      resolve(data);
    });
  }
}