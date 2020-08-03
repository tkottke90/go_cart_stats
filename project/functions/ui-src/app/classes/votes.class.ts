export namespace Votes {

  export interface Vote {
    voter: string;
    ballot: string;
    date: number;
    invalid?: boolean;
  }

  export interface DailyRecord {
    lastUpdated: number;
    count: number;
    open: boolean;
    votes: Vote[];
  }
}