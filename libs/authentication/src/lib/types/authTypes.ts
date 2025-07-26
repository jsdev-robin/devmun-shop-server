/* eslint-disable @typescript-eslint/no-namespace */
import { IUser } from '@server/models';

declare global {
  namespace Express {
    interface Request {
      self: IUser;
      remember: boolean;
      redirect: string;
      useragent?: {
        isMobile: boolean;
        isMobileNative: boolean;
        isTablet: boolean;
        isiPad: boolean;
        isiPod: boolean;
        isiPhone: boolean;
        isAndroid: boolean;
        isBlackberry: boolean;
        isOpera: boolean;
        isIE: boolean;
        isEdge: boolean;
        isIECompatibilityMode: boolean;
        isSafari: boolean;
        isFirefox: boolean;
        isWebkit: boolean;
        isChrome: boolean;
        isKonqueror: boolean;
        isOmniWeb: boolean;
        isSeaMonkey: boolean;
        isFlock: boolean;
        isAmaya: boolean;
        isEpiphany: boolean;
        isDesktop: boolean;
        isWindows: boolean;
        isWindowsPhone: boolean;
        isLinux: boolean;
        isLinux64: boolean;
        isMac: boolean;
        isChromeOS: boolean;
        isBada: boolean;
        isSamsung: boolean;
        isRaspberry: boolean;
        isBot: boolean;
        isCurl: boolean;
        isAndroidTablet: boolean;
        isWinJs: boolean;
        isKindleFire: boolean;
        isSilk: boolean;
        isCaptive: boolean;
        isSmartTV: boolean;
        silkAccelerated: boolean;
        browser: string;
        version: string;
        os: string;
        platform: string;
        geoIp: { [key: string]: unknown };
        source: string;
      };
    }
  }
}
