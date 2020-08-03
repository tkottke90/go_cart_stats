export namespace Races { 
  
  export interface Lap {
    [key: string]: any;
    time: string;
    bestLap: boolean;
    position?: string;
  }

  export interface Entry {
    userId: string;
    date: number;
    cartNumber: string;
    totalTime: string;
    bestTime: string;
    trackId?: string;
    laps: Lap[]
    invalid?: boolean;
  }
}