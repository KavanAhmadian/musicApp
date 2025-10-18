import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { key, action, user_name, pageno, ...otherParams } = body;

        // بررسی فیلدهای ضروری
        if (!key || !action) {
            return NextResponse.json(
                { state_all: "F", msg: "فیلدهای key و action الزامی هستند" },
                { status: 400 }
            );
        }

        // بررسی کلید امنیتی
        if (key !== 'sdifu4530dsf98sf0sdf') {
            return NextResponse.json(
                { state_all: "F", msg: "کلید امنیتی نامعتبر است" },
                { status: 401 }
            );
        }

        // ساخت URL پارامترها
        const urlParams = new URLSearchParams({
            key,
            action,
            ...(user_name && { user_name }),
            ...(pageno && { pageno }),
            ...otherParams
        });

        // ارسال درخواست به سرور اصلی
        const response = await fetch(
            `https://rubibox.ir/app-plus/api-test-web.php?${urlParams.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // timeout برای fetch در محیط سرور Next.js
                signal: AbortSignal.timeout(10000)
            }
        );

        if (!response.ok) {
            throw new Error(`سرور اصلی پاسخ نامعتبر داد: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in CPlayList API route:', error);

        if (error.name === 'TimeoutError') {
            return NextResponse.json(
                { state_all: "F", msg: "Timeout در ارتباط با سرور" },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { state_all: "F", msg: "خطا در ارتباط با سرور اصلی" },
            { status: 502 }
        );
    }
}