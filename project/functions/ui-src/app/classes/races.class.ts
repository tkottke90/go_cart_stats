export namespace Races { 
  
  export interface Lap {
    [key: string]: any;
    time: string;
    bestLap: boolean;
    position?: string;
  }

  export interface Entry {
    userId: string;
    date: string;
    cartNumber: string;
    totalTime: string;
    bestTime: string;
    track?: string;
    times: Lap[]
    invalid?: boolean;
  }
}