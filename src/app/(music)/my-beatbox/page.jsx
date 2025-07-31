'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Icon } from "@iconify/react";
import ProtectedRoute from "@/component/ProtectedRoute";

export default function MyBeatBoxPage() {
    const [user, setUser] = useState({ name: '', phone: '', vote: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user info", e);
        }
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <span className="text-white">در حال بارگذاری...</span>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div>
                <div className="w-full bg-gradient-to-b from-black to-[#4e4e4e] rounded-b-2xl py-8 flex flex-col items-center justify-center">
          <span className="text-white text-[18px] mb-2">
            {user.name || 'کاربر'} - {user.phone}
          </span>
                    <span className="text-[#FFEB3B] text-[21px]">
            تعداد امتیاز : {user.vote ?? 0}
          </span>
                    <div className="flex items-center flex-wrap justify-center gap-8 mt-8 w-full">
                        <button className="py-3 px-3 md:px-5 w-40 sm:w-50 md:w-80 bg-neutral-600 text-white">دریافت امتیاز رایگان</button>
                        <button className="py-3 px-3 md:px-5 w-40 sm:w-50 md:w-80 bg-neutral-600 text-white">خرید امتیاز</button>
                    </div>
                </div>

                <div className="flex flex-col mb-[100px] items-center justify-center gap-2 mx-auto w-9/10 mt-8">
                    {[
                        { href: "/", icon: 'solar:music-notes-linear', label: 'پلی لیست من', bg: 'from-[#865922] to-[#DFA40C]' },
                        { href: "/", icon: 'solar:playlist-minimalistic-3-linear', label: 'پلی لیست های دنبال شده', bg: 'from-[#2E5D2C] to-[#81BC3E]' },
                        { href: "/", icon: 'solar:list-check-minimalistic-bold', label: 'آلبوم های دنبال شده', bg: 'from-[#04413A] to-[#099082]' },
                        { href: "/", icon: 'solar:music-note-4-linear', label: 'خوانندگان دنبال شده', bg: 'from-[#255476] to-[#048BCD]' },
                        { href: "/liked-songs", icon: 'solar:heart-linear', label: 'آهنگ های پسند شده', bg: 'from-[#66332B] to-[#EF564A]' },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-[#454545] w-full flex gap-4 items-center justify-start">
                            <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-b ${item.bg}`}>
                                <Icon icon={item.icon} className="text-[30px]" />
                            </div>
                            <Link href={item.href}>{item.label}</Link>
                        </div>
                    ))}
                    <hr className="my-2 border-b-1 border-neutral-800 w-full" />
                    <div className="bg-[#454545] w-full flex gap-4 items-center justify-start">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-b from-[#054139] to-[#1A857F]">
                            <Icon icon="solar:headphones-round-sound-outline" className="text-[30px]" />
                        </div>
                        <Link href="/">پشتیبانی/ درخواست آهنگ</Link>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
