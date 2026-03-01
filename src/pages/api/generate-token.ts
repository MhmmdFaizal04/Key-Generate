import type { APIRoute } from 'astro';
import { query } from '../../lib/db';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { serverId } = data;

        if (!serverId) {
            return new Response(JSON.stringify({ error: 'Server ID required' }), { status: 400 });
        }

        // 1. Check if server is active
        const serverResult = await query('SELECT * FROM redirect_links WHERE id = $1 AND is_active = true', [serverId]);
        if (serverResult.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Server not available or inactive' }), { status: 404 });
        }

        const server = serverResult.rows[0];

        // 2. Generate unique token
        const token = crypto.randomBytes(32).toString('hex');

        // 3. Save to DB
        await query(
            'INSERT INTO access_tokens (token, server_id, used) VALUES ($1, $2, false)',
            [token, serverId]
        );

        // 4. Set Cookie for verification later when user comes back from shortlink
        cookies.set('pending_access_token', token, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax', // Must be lax so cross-site redirect (from bicolink) sends the cookie
            maxAge: 60 * 30 // 30 minutes to complete the shortlink
        });

        // 5. Return the Bicolink URL
        return new Response(JSON.stringify({
            success: true,
            redirectUrl: server.shortlink_url
        }), { status: 200 });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
