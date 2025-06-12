// app/login/actions.js (Server Action)
'use server';

import { cookies } from 'next/headers';

export async function login(formData) {
    const user_name = formData.get('user_name');
    const pass = formData.get('pass');

    const form = new FormData();
    form.append('user_name', user_name);
    form.append('pass', pass);

    const response = await fetch('https://rubibox.ir/app-plus/api-test-users.php?key=sdifu4530dsf98sf0sdf&action=login', {
        method: 'POST',
        body: form,
    });

    const data = await response.json();
    const user = data.infos[0];

    if (user?.login === "T") {
        const cookieStore = cookies();
        await cookieStore.set('session_token', user.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        await cookieStore.set('user_info', JSON.stringify({
            name: user.name,
            phone: user.user_name,
            vote: user.voite,
        }), {
            httpOnly: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return { success: true };
    } else {
        return { error: 'ورود ناموفق' };
    }
}
