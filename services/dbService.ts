// services/dbService.ts

import { Category, Note, Tag } from '../types';
import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('notes_app.db');

// 1. Initialize the database


// 2. Create Tables
export const initDb = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`
        PRAGMA foreign_keys = ON;
      `);

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS note_tags (
          note_id INTEGER,
          tag_id INTEGER,
          PRIMARY KEY (note_id, tag_id),
          FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
        );`,
        [],
        () => {
          console.log('✅ Database initialized');
          resolve();
        },
        (_, err) => {
          console.error('❌ DB init error:', err);
          reject(err);
          return false;
        }
      );
    });
  });
};

// 3. Categories
export const addCategory = (category: Category): Promise<number> =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO categories (name, color) VALUES (?, ?)',
        [category.name, category.color || '#000000'],
        (_, res) => resolve(res.insertId!),
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });

export const getCategories = (): Promise<Category[]> =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM categories ORDER BY name',
        [],
        (_, res) => resolve(res.rows._array),
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });

// 4. Notes
export const addNote = (note: Note): Promise<number> =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO notes (title, content, category_id) VALUES (?, ?, ?)',
        [note.title, note.content, note.category_id || null],
        (_, res) => resolve(res.insertId!),
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });

export const getNotes = (): Promise<Note[]> =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notes ORDER BY updated_at DESC',
        [],
        (_, res) => resolve(res.rows._array),
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });

// 5. Tags
export const addTag = (tagName: string): Promise<number> =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR IGNORE INTO tags (name) VALUES (?)',
        [tagName],
        (_, res) => resolve(res.insertId!),
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });

export const getTags = (): Promise<Tag[]> =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tags ORDER BY name',
        [],
        (_, res) => resolve(res.rows._array),
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
