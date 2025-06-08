"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

const sidebarLinks = [
    { href: "/", iconn: 'solar:moon-linear', label: "حالت شب غیرفعال شود" },
    { href: "/", iconn: 'solar:refresh-bold', label: "بروزرسانی امتیاز" },
    { href: "/", iconn: 'solar:moon-linear', label: "خرید امتیاز" },
    { href: "/", iconn: 'solar:login-2-linear', label: "خروج از حساب کاربری" },
    { href: "/", iconn: 'solar:chat-round-dots-outline', label: "نظرات من" },
    { href: "/", iconn: 'solar:headphones-round-sound-outline', label: "پشتیبانی" },
    { href: "/", iconn: 'solar:smartphone-rotate-angle-broken', label: "آپدیت اپلیکیشن" },
    { href: "/", iconn: 'solar:share-linear', label: "معرفی به دوستان" },
];

export default function TopNav() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <>
            {/* Top Navigation (Fixed) */}
            <div className="fixed z-[999] top-0 left-0 right-0  bg-[#212121] flex items-center justify-between p-4 shadow-md">
                <button onClick={toggleSidebar}>
                    <Icon icon="solar:hamburger-menu-outline" className="w-8 h-8 text-white cursor-pointer" />
                </button>

                <div className="flex items-center gap-4">
                    <Icon icon="solar:vinyl-linear" className="w-8 h-8 text-white cursor-pointer" />
                    <Icon icon="solar:magnifer-outline" className="w-8 h-8 text-white cursor-pointer" />
                </div>
            </div>

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-72 bg-[#212121] text-white transform transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex items-center justify-between p-4 border-b border-[#2e2e2e]">
                    <div className="flex items-center gap-2">
                        <Image src="/image/logo.png" alt="بیت باکس" width={60} height={60} />
                        <h4 className="text-lg font-normal">بیت باکس</h4>
                    </div>
                    <button onClick={toggleSidebar}>
                        <Icon icon="solar:close-circle-outline" className="w-8 h-8 text-white cursor-pointer" />
                    </button>
                </div>

                <div className="flex flex-col items-start gap-2 p-4 border-b border-[#2e2e2e]">
                    <Link href={`/my-beatbox`} className="font-normal">هادی محمدی</Link>
                    <span className="font-normal text-gray-500">09198224892</span>
                    <div className="flex items-center gap-1">
                        <p className="font-normal">تعداد امتیاز :</p>
                        <span className="font-normal text-[#FFEB3B]">33</span>
                    </div>
                </div>

                <div className="p-4 space-y-5">
                    {sidebarLinks.map(({ href, iconn, label }, index) => (
                        <Link
                            key={label}
                            href={href}
                            className={`flex items-center gap-2 pb-2 ${index === 0 || index === 4 ? "border-b border-white" : ""}`}
                        >
                            <Icon icon={iconn} className="w-5 h-5" />
                            <span className="text-[14px]">{label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div onClick={toggleSidebar} className="fixed inset-0 z-40 bg-black/50" />
            )}

            {/* Spacer for Fixed TopNav */}
            <div className="h-[72px]" /> {/* به اندازه ارتفاع نوار بالا برای جلوگیری از پوشاندن محتوا */}
        </>
    );
}

