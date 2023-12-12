import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    user: {
      login: string;
      display: string;
      spoota: string;
      spootr: string;
      id: string;
      modFor: string[];
      settings: {
        autoAccept: boolean;
      };
    };
  }
}
