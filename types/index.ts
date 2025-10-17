// types/index.ts

export interface Category {
  id?: number;
  name: string;
  color?: string;
  created_at?: string;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id?: number;
  name: string;
}

export interface NoteTag {
  note_id: number;
  tag_id: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  sortBy: 'date' | 'title' | 'category';
  fontSize: 'small' | 'medium' | 'large';
}

export interface Credentials {
  pin?: string;
  apiToken?: string;
  userId?: string;
}