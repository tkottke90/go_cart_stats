export namespace Races { 
  
  export interface Lap {
    time: string;
    bestLap: boolean;
    position?: number;
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