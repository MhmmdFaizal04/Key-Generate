import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;

export function getDb() {
    if (!pool) {
        const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error("DATABASE_URL is not set in the environment variables");
        }

        pool = new Pool({ connectionString });
    }
    return pool;
}

export async function query(text: string, params?: any[]) {
    const client = await getDb().connect();
    try {
        const res = await client.query(text, params);
        return res;
    } finally {
        client.release();
    }
}
