export namespace User {

  export interface Details {
    id: string;
    displayName?: string;
    nickname?: string;
    email: string;
    experience?: number;
    number: string;
    rival?: string;
    new?: boolean
  }

  export interface NewUserInfo {
    displayName: string;
    nickname: string;
    experience: number;
    new: boolean;
  }

}