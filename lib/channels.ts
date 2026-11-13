import fs from 'fs';
import path from 'path';
import channelsJson from '@/data/channels.json';
import categoriesJson from '@/data/categories.json';
import { Channel, Category } from '@/types/channel';

export { PREFERRED_LANGUAGES } from './constants';

export function getChannels(): Channel[] {
  let list = channelsJson as Channel[];
  try {
    const channelsPath = path.join(process.cwd(), 'data', 'channels.json');
    if (fs.existsSync(channelsPath)) {
      const raw = fs.readFileSync(channelsPath, 'utf8');
      list = JSON.parse(raw) as Channel[];
    }
  } catch (err) {
    console.warn('Failed to read data/channels.json via fs, using static json:', err);
  }

  // Assign 1-based sequential channel number (CH 01, CH 02...)
  return list.map((c, index) => ({
    ...c,
    chNumber: c.chNumber || index + 1,
  }));
}

export function getChannelById(id: string): Channel | undefined {
  const channels = getChannels();
  return channels.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

export function getChannelByNumber(chNum: number): Channel | undefined {
  const channels = getChannels();
  return channels.find((c) => c.chNumber === chNum);
}

export function getCategories(): Category[] {
  try {
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    if (fs.existsSync(categoriesPath)) {
      const raw = fs.readFileSync(categoriesPath, 'utf8');
      return JSON.parse(raw) as Category[];
    }
  } catch (err) {
    console.warn('Failed to read data/categories.json via fs, using static json:', err);
  }
  return categoriesJson as Category[];
}
