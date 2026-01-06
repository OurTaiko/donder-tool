export interface Song {
    id: number;
    open_day: string;
    song_name: string;
    song_name_jp: string;
    subtitle: string | null;
    type: string;
    family: string | null;
    sort: number;
    levels: (number | string)[];
}
    
interface RawSong {
  sort: number;
  id: number;
  open_day: string;
  type: string;
  song_name_jp: string;
  song_name: string;
  level_1: number | string;
  level_2: number | string;
  level_3: number | string;
  level_4: number | string;
  level_5: number | string;
  subtitle: string | null;
  family: string | null;
}


export function RawToSong(raw: RawSong): Song {
  return {
    id: raw.id,
    open_day: raw.open_day,
    song_name: raw.song_name,
    song_name_jp: raw.song_name_jp,
    subtitle: raw.subtitle,
    type: raw.type,
    family: raw.family,
    sort: raw.sort,
    levels: [
      raw.level_1,
      raw.level_2,
      raw.level_3,
      raw.level_4,
      raw.level_5
    ]
  };
}