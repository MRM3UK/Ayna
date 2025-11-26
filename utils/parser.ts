import { Channel, Category } from '../types';

export const parseM3U = (content: string): { channels: Channel[]; categories: Category[] } => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith('#EXTINF:')) {
      // Parse metadata
      const info = line.substring(8);
      const attributes: any = {};
      
      // Extract tvg-logo
      const logoMatch = info.match(/tvg-logo="([^"]*)"/);
      if (logoMatch) attributes.logo = logoMatch[1];

      // Extract group-title
      const groupMatch = info.match(/group-title="([^"]*)"/);
      if (groupMatch) attributes.group = groupMatch[1];
      else attributes.group = "Uncategorized";

      // Extract name (last part after comma)
      const nameParts = info.split(',');
      attributes.name = nameParts[nameParts.length - 1].trim();

      currentChannel = {
        ...attributes,
      };
    } else if (!line.startsWith('#')) {
      // It's a URL
      if (currentChannel.name) {
        channels.push({
          id: btoa(line + currentChannel.name).substring(0, 12), // Generate a pseudo-ID
          name: currentChannel.name || 'Unknown Channel',
          logo: currentChannel.logo || '',
          group: currentChannel.group || 'Uncategorized',
          url: line,
        });
        currentChannel = {};
      }
    }
  });

  // Group by categories
  const groups: Record<string, Channel[]> = {};
  channels.forEach((ch) => {
    if (!groups[ch.group]) {
      groups[ch.group] = [];
    }
    groups[ch.group].push(ch);
  });

  const categories: Category[] = Object.keys(groups)
    .sort()
    .map((group) => ({
      name: group,
      channels: groups[group],
    }));

  return { channels, categories };
};

export const DEFAULT_PLAYLIST_URL = "https://raw.githubusercontent.com/hasanhabibmottakin/AynaOTT/refs/heads/main/playlist.m3u";