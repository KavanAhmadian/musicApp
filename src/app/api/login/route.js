// app/api/login/route.js
export const runtime = 'nodejs';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const body = await req.json();
        const { user_name, pass } = body;

        const formData = new FormData();
        formData.append('user_name', user_name);
        formData.append('pass', pass);

        const response = await fetch('https://rubibox.ir/app-plus/api-test-users.php?key=sdifu4530dsf98sf0sdf&action=login', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        const user = data.infos[0];

        if (user?.login === "T") {
            const userInfo = {
                name: user.name,
                phone: user.user_name,
                vote: user.voite
            };

            const cookieStore = cookies();
            cookieStore.set('session_token', user.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            });

            return new Response(JSON.stringify({
                message: 'ورود موفق',
                user: userInfo  // Make sure to return user info
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ msg: user?.msg || "ورود ناموفق" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (err) {
        console.error("Login API Error:", err);
        return new Response(JSON.stringify({ msg: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
