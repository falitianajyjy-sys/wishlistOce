import 'dotenv/config';
// @ts-ignore
import pg from 'pg';

// @ts-ignore
export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});