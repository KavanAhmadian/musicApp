import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();

        // ارسال به rubibox
        const upstreamRes = await fetch('https://rubibox.ir/app-plus/api-test-users.php?key=sdifu4530dsf98sf0sdf&action=change_pass', {
            method: 'POST',
            body: formData,
        });

        const text = await upstreamRes.text();

        // همون پاسخ متنی رو برگردون
        return new NextResponse(text, {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (err) {
        console.error('Proxy error:', err);
        return new NextResponse('خطا در ارتباط با سرور', { status: 500 });
    }
}
