/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HabitId, StreakState, UserProfile, TargetKey } from '../types';
import { avatarStorage } from './avatarStorage';


export interface SQLResult {
  rows: any[];
  columns: string[];
  affectedRows: number;
  error?: string;
}

// Global simulated SQLite DB state
interface SQLiteDatabase {
  users: Array<{
    id: number;
    name: string;
    avatar: string;
    joined_date: string;
    language: string;
    theme: string;
  }>;
  habits: Array<{
    id: string;
    enabled: number; // 0 or 1
    target: string;
    start_date: string;
    current_streak: number;
    highest_streak: number;
    last_checkin: string | null;
    completed_target: number; // 0 or 1
  }>;
  checkins: Array<{
    id: number;
    habit_id: string;
    checkin_date: string; // YYYY-MM-DD
  }>;
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    timestamp: string;
    read: number;
  }>;
}

const STORAGE_KEY = 'rocket_streak_sqlite_db';

class SQLiteEngine {
  private db!: SQLiteDatabase;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.db = JSON.parse(raw);
        return;
      } catch (e) {
        console.error('Failed to parse SQLite Database, resetting...', e);
      }
    }

    // Default seeded database
    this.db = {
      users: [],
      habits: [
        { id: 'no-smoking', enabled: 0, target: '1-month', start_date: '', current_streak: 0, highest_streak: 0, last_checkin: null, completed_target: 0 },
        { id: 'no-masturbation', enabled: 0, target: '1-month', start_date: '', current_streak: 0, highest_streak: 0, last_checkin: null, completed_target: 0 },
        { id: 'no-porn', enabled: 0, target: '1-month', start_date: '', current_streak: 0, highest_streak: 0, last_checkin: null, completed_target: 0 },
        { id: 'no-drugs', enabled: 0, target: '1-month', start_date: '', current_streak: 0, highest_streak: 0, last_checkin: null, completed_target: 0 },
        { id: 'no-alcohol', enabled: 0, target: '1-month', start_date: '', current_streak: 0, highest_streak: 0, last_checkin: null, completed_target: 0 },
      ],
      checkins: [],
      notifications: [
        {
          id: 1,
          title: 'Welcome to Rocket Tracker!',
          message: 'Initialize your target, set up your profile and start your healthy flight to space.',
          timestamp: new Date().toISOString(),
          read: 0,
        },
      ],
    };
    this.save();
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  // Helper to split SQL commas safely (ignores commas inside quotes for things like Base64 images)
  private splitSqlCommas(str: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === "'" || char === '"') {
        if (char === "'" && inQuotes && quoteChar === "'" && str[i + 1] === "'") {
          current += "'";
          i++; // skip next single quote
          continue;
        }
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
          current += char;
        } else if (char === quoteChar) {
          inQuotes = false;
          current += char;
        } else {
          current += char;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // Raw SQL execution engine
  public executeSQL(sql: string): SQLResult {
    const cleanSql = sql.trim().replace(/;+$/, '').replace(/\s+/g, ' ');
    const parts = cleanSql.split(' ');
    const command = parts[0].toUpperCase();

    try {
      if (command === 'SELECT') {
        return this.handleSelect(cleanSql);
      } else if (command === 'UPDATE') {
        return this.handleUpdate(cleanSql);
      } else if (command === 'INSERT') {
        return this.handleInsert(cleanSql);
      } else if (command === 'DELETE') {
        return this.handleDelete(cleanSql);
      } else {
        throw new Error(`Unsupported SQL command: "${command}". Only SELECT, INSERT, UPDATE, DELETE are simulated.`);
      }
    } catch (e: any) {
      return {
        rows: [],
        columns: [],
        affectedRows: 0,
        error: e.message || 'Unknown SQL Error',
      };
    }
  }

  private handleSelect(sql: string): SQLResult {
    // Basic regex: SELECT (cols) FROM (table) [WHERE col = val]
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i);
    if (!selectMatch) {
      throw new Error('Invalid SELECT syntax. Try: SELECT * FROM checkins OR SELECT * FROM habits WHERE enabled = 1');
    }

    const colsStr = selectMatch[1].trim();
    const tableName = selectMatch[2].trim().toLowerCase();
    const whereStr = selectMatch[3] ? selectMatch[3].trim() : null;

    if (!(tableName in this.db)) {
      throw new Error(`Table "${tableName}" does not exist in SQLite schema.`);
    }

    const tableData = (this.db as any)[tableName] as any[];
    let filtered = [...tableData];

    if (whereStr) {
      const eqIdx = whereStr.indexOf('=');
      if (eqIdx !== -1) {
        const field = whereStr.substring(0, eqIdx).trim();
        let value: any = whereStr.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, ''); // strip quotes
        
        // Parse numbers/booleans
        if (value === '1') value = 1;
        if (value === '0') value = 0;
        if (value === 'null' || value === 'NULL') value = null;

        filtered = filtered.filter((row) => {
          let rowVal = row[field];
          if (typeof rowVal === 'boolean') {
            rowVal = rowVal ? 1 : 0;
          }
          return String(rowVal) === String(value);
        });
      } else {
        throw new Error('Only simple "WHERE column = value" condition is supported currently.');
      }
    }

    // Select specific columns
    let finalRows = filtered;
    let cols = Object.keys(tableData[0] || {});
    if (colsStr !== '*') {
      cols = colsStr.split(',').map((c) => c.trim());
      finalRows = filtered.map((row) => {
        const item: any = {};
        cols.forEach((c) => {
          item[c] = row[c];
        });
        return item;
      });
    }

    return {
      rows: finalRows,
      columns: cols,
      affectedRows: 0,
    };
  }

  private handleUpdate(sql: string): SQLResult {
    // Procedural parsing of UPDATE (table) SET (col = val, ...) [WHERE col = val]
    // To handle massive strings without catastrophic regex backtracking
    const upperSql = sql.toUpperCase();
    const updateWord = 'UPDATE ';
    if (!upperSql.startsWith(updateWord)) {
      throw new Error('Invalid UPDATE syntax. Missing UPDATE word.');
    }

    const setWordIdx = upperSql.indexOf(' SET ');
    if (setWordIdx === -1) {
      throw new Error('Invalid UPDATE syntax. Missing SET clause.');
    }

    const tableName = sql.substring(updateWord.length, setWordIdx).trim().toLowerCase();

    if (!(tableName in this.db)) {
      throw new Error(`Table "${tableName}" does not exist.`);
    }

    const whereWordIdx = upperSql.indexOf(' WHERE ', setWordIdx);
    let setStr = '';
    let whereStr: string | null = null;

    if (whereWordIdx !== -1) {
      setStr = sql.substring(setWordIdx + ' SET '.length, whereWordIdx).trim();
      whereStr = sql.substring(whereWordIdx + ' WHERE '.length).trim();
    } else {
      setStr = sql.substring(setWordIdx + ' SET '.length).trim();
    }

    // Parse SET pairs robustly using our custom comma splitter
    const setPairsRaw = this.splitSqlCommas(setStr);
    const updates: Record<string, any> = {};
    
    setPairsRaw.forEach((p) => {
      const eqIdx = p.indexOf('=');
      if (eqIdx === -1) {
        throw new Error(`Invalid SET pair: "${p}"`);
      }
      const col = p.substring(0, eqIdx).trim();
      const valRaw = p.substring(eqIdx + 1).trim();
      const cleanVal = valRaw.replace(/^['"]|['"]$/g, '');
      updates[col] = cleanVal;
    });

    const tableData = (this.db as any)[tableName] as any[];
    let affected = 0;

    tableData.forEach((row, idx) => {
      let matches = true;
      if (whereStr) {
        const eqIdx = whereStr.indexOf('=');
        if (eqIdx !== -1) {
          const field = whereStr.substring(0, eqIdx).trim();
          let value: any = whereStr.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (value === '1') value = 1;
          if (value === '0') value = 0;

          let rowVal = row[field];
          if (typeof rowVal === 'boolean') {
            rowVal = rowVal ? 1 : 0;
          }
          matches = String(rowVal) === String(value);
        }
      }

      if (matches) {
        affected++;
        Object.keys(updates).forEach((col) => {
          let val = updates[col];
          // Cast value based on existing column type
          const origType = typeof row[col];
          if (origType === 'number') {
            val = Number(val);
          } else if (origType === 'boolean') {
            val = val === '1' || val === 'true';
          } else if (val === 'null' || val === 'NULL') {
            val = null;
          }
          row[col] = val;
        });
      }
    });

    if (affected > 0) {
      this.save();
    }

    return {
      rows: [],
      columns: [],
      affectedRows: affected,
    };
  }

  private handleInsert(sql: string): SQLResult {
    // Procedural parsing of INSERT INTO (table) (cols) VALUES (vals)
    // To handle massive strings without catastrophic regex backtracking
    const upperSql = sql.toUpperCase();
    const insertIntoWord = 'INSERT INTO ';
    if (!upperSql.startsWith(insertIntoWord)) {
      throw new Error('Invalid INSERT syntax. Try: INSERT INTO checkins (habit_id, checkin_date) VALUES (\'no-smoking\', \'2026-08-04\')');
    }

    const openParenIdx = sql.indexOf('(');
    const valuesWordIdx = upperSql.indexOf('VALUES');

    if (openParenIdx === -1 || valuesWordIdx === -1) {
      throw new Error('Invalid INSERT syntax. Missing columns definition or VALUES clause.');
    }

    const tableName = sql.substring(insertIntoWord.length, openParenIdx).trim().toLowerCase();

    if (!(tableName in this.db)) {
      throw new Error(`Table "${tableName}" does not exist.`);
    }

    const closeParenIdx = sql.indexOf(')', openParenIdx);
    if (closeParenIdx === -1 || closeParenIdx > valuesWordIdx) {
      throw new Error('Invalid INSERT syntax. Unclosed columns parentheses.');
    }

    const colsStr = sql.substring(openParenIdx + 1, closeParenIdx).trim();
    const cols = colsStr.split(',').map((c) => c.trim());

    const valuesOpenParenIdx = sql.indexOf('(', valuesWordIdx);
    const valuesCloseParenIdx = sql.lastIndexOf(')');

    if (valuesOpenParenIdx === -1 || valuesCloseParenIdx === -1 || valuesCloseParenIdx < valuesOpenParenIdx) {
      throw new Error('Invalid INSERT syntax. Missing values definition.');
    }

    const valsStr = sql.substring(valuesOpenParenIdx + 1, valuesCloseParenIdx).trim();
    // Parse values list robustly using our custom comma splitter
    const vals = this.splitSqlCommas(valsStr).map((v) => v.trim().replace(/^['"]|['"]$/g, ''));

    if (cols.length !== vals.length) {
      throw new Error(`Column count (${cols.length}) does not match values count (${vals.length}).`);
    }

    const tableData = (this.db as any)[tableName] as any[];
    const nextId = tableData.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;

    const newRow: any = { id: nextId };
    cols.forEach((col, idx) => {
      let val: any = vals[idx];
      if (val === '1') val = 1;
      if (val === '0') val = 0;
      newRow[col] = val;
    });

    tableData.push(newRow);
    this.save();

    return {
      rows: [newRow],
      columns: Object.keys(newRow),
      affectedRows: 1,
    };
  }

  private handleDelete(sql: string): SQLResult {
    // DELETE FROM (table) [WHERE col = val]
    const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?$/i);
    if (!deleteMatch) {
      throw new Error('Invalid DELETE syntax. Try: DELETE FROM checkins WHERE habit_id = \'no-smoking\'');
    }

    const tableName = deleteMatch[1].trim().toLowerCase();
    const whereStr = deleteMatch[2] ? deleteMatch[2].trim() : null;

    if (!(tableName in this.db)) {
      throw new Error(`Table "${tableName}" does not exist.`);
    }

    const tableData = (this.db as any)[tableName] as any[];
    let affected = 0;
    let keptRows: any[] = [];

    tableData.forEach((row) => {
      let matches = true;
      if (whereStr) {
        const eqIdx = whereStr.indexOf('=');
        if (eqIdx !== -1) {
          const field = whereStr.substring(0, eqIdx).trim();
          let value: any = whereStr.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (value === '1') value = 1;
          if (value === '0') value = 0;

          let rowVal = row[field];
          if (typeof rowVal === 'boolean') {
            rowVal = rowVal ? 1 : 0;
          }
          matches = String(rowVal) === String(value);
        }
      } else {
        matches = true; // Delete everything if no WHERE
      }

      if (matches) {
        affected++;
      } else {
        keptRows.push(row);
      }
    });

    if (affected > 0) {
      (this.db as any)[tableName] = keptRows;
      this.save();
    }

    return {
      rows: [],
      columns: [],
      affectedRows: affected,
    };
  }

  // --- HIGH-LEVEL APP TRANSACTION WRAPPERS ---

  public getProfile(): UserProfile | null {
    const res = this.executeSQL('SELECT * FROM users');
    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    // Read selected_habits from enabled habits
    const enabledRes = this.executeSQL('SELECT id FROM habits WHERE enabled = 1');
    const selectedHabits = enabledRes.rows.map((h) => h.id as HabitId);

    return {
      name: r.name,
      avatarUrl: r.avatar,
      joinedDate: r.joined_date,
      language: (r.language || 'en') as 'en' | 'bn',
      theme: (r.theme || 'dark') as 'light' | 'dark',
      selectedHabits,
    };
  }

  public setProfile(profile: Omit<UserProfile, 'selectedHabits'>, activeHabits: HabitId[]) {
    let avatarToSave = profile.avatarUrl;
    if (profile.avatarUrl && profile.avatarUrl.startsWith('data:image/')) {
      // Save asynchronously in the background so it is persisted in IndexedDB
      avatarStorage.saveAvatar('user_avatar', profile.avatarUrl);
      avatarToSave = 'indexeddb:user_avatar';
    }

    if (this.db.users.length === 0) {
      this.db.users.push({
        id: 1,
        name: profile.name,
        avatar: avatarToSave,
        joined_date: profile.joinedDate,
        language: profile.language,
        theme: profile.theme,
      });
    } else {
      this.db.users[0].name = profile.name;
      this.db.users[0].avatar = avatarToSave;
      this.db.users[0].language = profile.language;
      this.db.users[0].theme = profile.theme;
    }
    this.save();

    // Disable all habits, then enable specific ones
    this.executeSQL('UPDATE habits SET enabled = 0');
    activeHabits.forEach((id) => {
      this.executeSQL(`UPDATE habits SET enabled = 1 WHERE id = '${id}'`);
    });
  }

  public getStreaks(): Record<HabitId, StreakState> {
    const habitsRes = this.executeSQL('SELECT * FROM habits');
    const checkinsRes = this.executeSQL('SELECT * FROM checkins');

    const checkinsMap: Record<string, string[]> = {};
    checkinsRes.rows.forEach((c) => {
      if (!checkinsMap[c.habit_id]) {
        checkinsMap[c.habit_id] = [];
      }
      checkinsMap[c.habit_id].push(c.checkin_date);
    });

    const result: Record<HabitId, StreakState> = {} as any;

    habitsRes.rows.forEach((h) => {
      const targetDaysMap: Record<TargetKey, number> = {
        '1-month': 30,
        '3-months': 90,
        '6-months': 180,
        '1-year': 365,
      };

      const hId = h.id as HabitId;
      result[hId] = {
        habitId: hId,
        currentStreak: h.current_streak,
        highestStreak: h.highest_streak,
        startDate: h.start_date || new Date().toISOString().split('T')[0],
        lastCheckIn: h.last_checkin,
        target: h.target as TargetKey,
        targetDays: targetDaysMap[h.target as TargetKey] || 30,
        completedTarget: h.completed_target === 1,
        history: checkinsMap[hId] || [],
      };
    });

    return result;
  }

  public checkIn(habitId: HabitId, dateStr: string): { success: boolean; isTargetMilestone: boolean } {
    const streaks = this.getStreaks();
    const streak = streaks[habitId];
    if (!streak) return { success: false, isTargetMilestone: false };

    // Prevent duplicate check-in
    if (streak.history.includes(dateStr)) {
      return { success: false, isTargetMilestone: false };
    }

    // Insert check-in
    this.executeSQL(`INSERT INTO checkins (habit_id, checkin_date) VALUES ('${habitId}', '${dateStr}')`);

    // Calculate new streak
    let current = streak.currentStreak;
    const lastCheck = streak.lastCheckIn;

    if (!lastCheck) {
      current = 1;
    } else {
      const lastDate = new Date(lastCheck);
      const curDate = new Date(dateStr);
      const diffTime = Math.abs(curDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1.5) { // consecutive day (allowing minor timezone overlaps)
        current += 1;
      } else {
        current = 1; // broken and restarted
      }
    }

    const highest = Math.max(streak.highestStreak, current);
    const completed = current >= streak.targetDays;
    const isTargetMilestone = completed && !streak.completedTarget;

    this.executeSQL(
      `UPDATE habits SET current_streak = ${current}, highest_streak = ${highest}, last_checkin = '${dateStr}', completed_target = ${completed ? 1 : 0} WHERE id = '${habitId}'`
    );

    return { success: true, isTargetMilestone };
  }

  public failHabit(habitId: HabitId): { currentStreak: number; highestStreak: number } {
    const streaks = this.getStreaks();
    const streak = streaks[habitId];
    if (!streak) return { currentStreak: 0, highestStreak: 0 };

    const highest = streak.highestStreak;

    // Reset current streak to 0, clear last check in
    this.executeSQL(
      `UPDATE habits SET current_streak = 0, last_checkin = NULL, completed_target = 0 WHERE id = '${habitId}'`
    );

    return {
      currentStreak: 0,
      highestStreak: highest,
    };
  }

  public recoverDays(habitId: HabitId, daysToRecover: number): boolean {
    if (daysToRecover <= 0 || daysToRecover > 10) return false;

    const streaks = this.getStreaks();
    const streak = streaks[habitId];
    if (!streak) return false;

    let referenceDate = streak.lastCheckIn ? new Date(streak.lastCheckIn) : new Date();

    // Recover up to N days consecutively backward
    for (let i = 1; i <= daysToRecover; i++) {
      const recoveredDate = new Date(referenceDate);
      recoveredDate.setDate(recoveredDate.getDate() - i);
      const dateStr = recoveredDate.toISOString().split('T')[0];

      if (!streak.history.includes(dateStr)) {
        this.executeSQL(`INSERT INTO checkins (habit_id, checkin_date) VALUES ('${habitId}', '${dateStr}')`);
      }
    }

    // Set new current streak
    const newStreak = streak.currentStreak + daysToRecover;
    const newHighest = Math.max(streak.highestStreak, newStreak);
    const completed = newStreak >= streak.targetDays;

    // Set last check in back to today to allow continuation
    const todayStr = new Date().toISOString().split('T')[0];

    this.executeSQL(
      `UPDATE habits SET current_streak = ${newStreak}, highest_streak = ${newHighest}, last_checkin = '${todayStr}', completed_target = ${completed ? 1 : 0} WHERE id = '${habitId}'`
    );

    return true;
  }

  public updateTarget(habitId: HabitId, target: TargetKey) {
    this.executeSQL(`UPDATE habits SET target = '${target}', completed_target = 0 WHERE id = '${habitId}'`);
  }

  public resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.initDatabase();
  }

  public getRawDatabase(): SQLiteDatabase {
    return this.db;
  }
}

export const sqlite = new SQLiteEngine();
export default sqlite;
