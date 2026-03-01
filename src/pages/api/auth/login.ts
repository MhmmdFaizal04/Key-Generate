import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { username, password } = data;

        const adminUsername = import.meta.env.ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

        // In a real app, you should use bcrypt for admin password too, but for simplicity based on prompt:
        if (username === adminUsername && password === adminPassword) {
            const secret = import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'default-secret';

            const token = jwt.sign({ role: 'admin', username }, secret, { expiresIn: '1d' });

            cookies.set('admin_token', token, {
                path: '/',
                httpOnly: true,
                secure: import.meta.env.PROD,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 // 1 day
            });

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
