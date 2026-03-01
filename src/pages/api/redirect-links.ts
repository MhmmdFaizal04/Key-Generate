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

export const GET: APIRoute = async ({ request, cookies }) => {
    if (!authenticate(request, cookies)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const result = await query('SELECT * FROM redirect_links ORDER BY id ASC');
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
        const { server_name, label, shortlink_url, callback_url } = data;

        if (!server_name || !label || !shortlink_url) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const insertResult = await query(
            'INSERT INTO redirect_links (server_name, label, shortlink_url, callback_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [server_name, label, shortlink_url, callback_url || '']
        );

        return new Response(JSON.stringify({ success: true, link: insertResult.rows[0] }), { status: 201 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
    if (!authenticate(request, cookies)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const data = await request.json();
        const { id, server_name, label, shortlink_url, callback_url, is_active } = data;

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
        }

        const updateResult = await query(
            `UPDATE redirect_links 
       SET server_name = COALESCE($1, server_name), 
           label = COALESCE($2, label), 
           shortlink_url = COALESCE($3, shortlink_url), 
           callback_url = COALESCE($4, callback_url), 
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6 RETURNING *`,
            [server_name, label, shortlink_url, callback_url, is_active, id]
        );

        return new Response(JSON.stringify({ success: true, link: updateResult.rows[0] }), { status: 200 });
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
        const { id } = data;

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
        }

        await query('DELETE FROM redirect_links WHERE id = $1', [id]);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
