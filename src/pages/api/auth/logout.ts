import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
    // Explicitly set maxAge to 0 to ensure the browser deletes it
    cookies.set('admin_token', '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax'
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
