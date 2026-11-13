export type ChannelLanguage =
  | 'Hindi'
  | 'English'
  | 'Bengali'
  | 'Kannada'
  | 'Telugu'
  | 'Marathi'
  | 'Urdu'
  | 'Malayalam'
  | string;

export interface Channel {
  id: string;
  name: string;
  category: string;
  language: ChannelLanguage;
  epgId: string;
  logo: string;
  hlsUrl: string;
  headers?: Record<string, string>;
  chNumber?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  badge?: string;
  icon: string;
}

export interface EPGProgram {
  channelId: string;
  title: string;
  description: string;
  start: string;
  end: string;
}
