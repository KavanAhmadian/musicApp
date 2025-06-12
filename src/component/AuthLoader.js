// components/AuthLoader.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLoader() {
    const router = useRouter();

    useEffect(() => {
        // Check authentication status
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            router.push('/login');
        }
    }, []);

    return null;
}