import { fromFetch } from 'rxjs/fetch';

export class HTTPService {

  public static createHeaders(options: any): Headers {
    const headers = new Headers();
    for (let option in options) {
      headers.append(option, options[option]);
    }

    return headers
  }

  public static get(url: string, options: Headers = new Headers()){
    const request: RequestInit = { headers: options, method: 'GET' }    
    return fromFetch(url, request);
  }

  public static post(url: string, data: any, options: Headers = new Headers()){
    const request: RequestInit = { body: data, headers: options, method: 'GET' }    
    return fromFetch(url, request);
  }

  public static delete(url: string, options: Headers = new Headers()){
    const request: RequestInit = { headers: options, method: 'GET' }    
    return fromFetch(url, request);
  }

}