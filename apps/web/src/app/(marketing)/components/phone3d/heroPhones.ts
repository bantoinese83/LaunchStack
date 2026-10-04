export type HeroPhonePlatform = 'ios' | 'android';

export type HeroPhoneScreen = {
  id: string;
  label: string;
  platform: HeroPhonePlatform;
  media: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
};

export const HERO_PHONE_SCREENS: HeroPhoneScreen[] = [
  {
    id: 'ios',
    label: 'iOS · Sign in',
    platform: 'ios',
    media: 'image',
    src: '/marketing/signin-ios.png',
    alt: 'LaunchStack sign-in screen on iPhone',
  },
  {
    id: 'android',
    label: 'Android · Sign in',
    platform: 'android',
    media: 'image',
    src: '/marketing/signin-android.png',
    alt: 'LaunchStack sign-in screen on Android',
  },
];
