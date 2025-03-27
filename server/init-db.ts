import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default postgres database first
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function initializeDatabase() {
  try {
    // Drop database if it exists
    await pool.query(`
      DROP DATABASE IF EXISTS virtualstage;
    `);
    console.log('Dropped existing database');
    
    // Create database
    await pool.query(`
      CREATE DATABASE virtualstage
      WITH 
      OWNER = postgres
      ENCODING = 'UTF8'
      LC_COLLATE = 'C'
      LC_CTYPE = 'C'
      TABLESPACE = pg_default
      TEMPLATE = template0
      CONNECTION LIMIT = -1;
    `);
    console.log('Database created successfully');
  } catch (err: any) {
    console.error('Error creating database:', err);
    return;
  }

  // Connect to the virtualstage database
  const client = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'virtualstage',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        genre VARCHAR(50),
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        duration INTEGER NOT NULL,
        artist VARCHAR(255),
        thumbnail VARCHAR(255),
        video_url VARCHAR(255),
        stream_url VARCHAR(255),
        environment VARCHAR(50) NOT NULL,
        is_live BOOLEAN DEFAULT false,
        is_premium BOOLEAN DEFAULT false,
        tags TEXT[],
        spatial_audio BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        reaction_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
      );

      CREATE TABLE IF NOT EXISTS user_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        interaction_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
      );
    `);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await client.end();
    await pool.end();
  }
}

initializeDatabase().catch(console.error); 