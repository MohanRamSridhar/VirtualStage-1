import pkg from 'pg';
const { Pool } = pkg;
import { Event, Reaction, UserHistory } from './types';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'virtualstage',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to PostgreSQL database');
  }
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  
  // Helper functions for common queries
  getEvent: async (id: number): Promise<Event | null> => {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0] || null;
  },
  
  getEvents: async (): Promise<Event[]> => {
    const result = await pool.query('SELECT * FROM events ORDER BY date DESC');
    return result.rows;
  },
  
  getReactions: async (eventId: number): Promise<Reaction[]> => {
    const result = await pool.query(
      'SELECT * FROM reactions WHERE event_id = $1 ORDER BY timestamp DESC',
      [eventId]
    );
    return result.rows;
  },
  
  getUserHistory: async (userId: number): Promise<UserHistory[]> => {
    const result = await pool.query(
      `SELECT e.*, r.type as reaction_type, r.timestamp 
       FROM events e 
       JOIN reactions r ON e.id = r.event_id 
       WHERE r.user_id = $1 
       ORDER BY r.timestamp DESC`,
      [userId]
    );
    return result.rows;
  },
  
  addReaction: async (userId: number, eventId: number, type: string): Promise<Reaction> => {
    const result = await pool.query(
      `INSERT INTO reactions (user_id, event_id, type, timestamp) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [userId, eventId, type]
    );
    return result.rows[0];
  }
};

export default pool; 