export namespace Votes {

  export interface Vote {
    userId: string;
    ballot: string;
    invalid?: boolean;
  }
}