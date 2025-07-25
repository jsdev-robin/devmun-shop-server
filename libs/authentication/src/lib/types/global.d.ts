import 'express';

declare module 'express' {
  interface Request {
    ipinfo?: {
      ip: string;
      city: string;
      region: string;
      country: string;
      loc: string;
      org: string;
      postal: string;
      timezone: string;
      countryCode?: string;
      countryFlag?: {
        emoji: string;
        unicode: string;
      };
      countryFlagURL?: string;
      countryCurrency?: {
        code: string;
        symbol: string;
      };
      continent?: {
        code: string;
        name: string;
      };
      isEU?: boolean;
      [key: string]: unknown;
    };
    useragent?: {
      browser?: string;
      version?: string;
      os?: string;
      platform?: string;
      source?: string;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      self: IUser;
      remember: boolean;
      redirect: string;
    }
  }
}

export interface ISignup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IVerifyEmail {
  otp: string;
  token: string;
}

export interface ISignin {
  email: string;
  password: string;
  remember: boolean;
}

export interface IPasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

export interface IUpdateEmail {
  newEmail: string;
  password: string;
}
