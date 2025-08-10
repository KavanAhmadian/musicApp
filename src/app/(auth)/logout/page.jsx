// app/logout/page.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {

        const timer = setTimeout(() => router.push('/'), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>شما با موفقیت خارج شدید... در حال انتقال به صفحه اصلی</p>
        </div>
    );
}