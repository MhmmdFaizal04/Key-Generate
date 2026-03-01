import type { APIRoute } from 'astro';
import { query } from '../../lib/db';
import jwt from 'jsonwebtoken';

function authenticate(request: Request, cookies: any) {
    const token = cookies.get('admin_token')?.value;
    if (!token) return false;

    try {
        const secret = import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'default-secret';
        jwt.verify(token, secret);
        return true;
    } catch (e) {
        return false;
    }
}

function generateRandomString(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const GET: APIRoute = async ({ request, cookies }) => {
    if (!authenticate(request, cookies)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const result = await query('SELECT * FROM keys ORDER BY created_at DESC');
        return new Response(JSON.stringify(result.rows), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, cookies }) => {
    if (!authenticate(request, cookies)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const data = await request.json();
        const count = data.count || 10;

        const newKeys = [];
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3); // 3 days expiry

        for (let i = 0; i < count; i++) {
            const username = `Zall_${generateRandomString(5)}`;
            const password = `Zall${generateRandomString(8)}`;

            const insertResult = await query(
                'INSERT INTO keys (username, password, expires_at) VALUES ($1, $2, $3) RETURNING *',
                [username, password, expiresAt]
            );

            newKeys.push(insertResult.rows[0]);
        }

        return new Response(JSON.stringify({ success: true, keys: newKeys }), { status: 201 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
    if (!authenticate(request, cookies)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const data = await request.json();
        const id = data.id;

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
        }

        await query('DELETE FROM keys WHERE id = $1', [id]);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
