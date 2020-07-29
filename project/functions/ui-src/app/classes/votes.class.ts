export namespace Votes {

  export interface Vote {
    userId: string;
    ballot: string;
    date: string;
    invalid?: boolean;
  }
}