export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

export interface Category {
  name: string;
  channels: Channel[];
}

export interface PlaylistState {
  url: string;
  channels: Channel[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export enum ViewState {
  BROWSE = 'BROWSE',
  WATCH = 'WATCH',
  SETTINGS = 'SETTINGS',
  SEARCH = 'SEARCH',
  FAVORITES = 'FAVORITES',
  CATEGORY = 'CATEGORY',
  HISTORY = 'HISTORY'
}