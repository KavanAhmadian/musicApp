"use client";

import React from "react";
import Link from "next/link";
import Play from "@/assets/icons/Play02-01.svg";
import Songs from "@/assets/icons/songs.svg";
import Vitrin from "@/assets/icons/vitrin.svg";
import Playlist from "@/assets/icons/Playlist-01.svg";
import {usePathname} from "next/navigation";

function RightSidebar() {
    const pathname = usePathname();

    const links = [
        {href: "/video", label: "موزیک ویدیو", icon: Play},
        {href: "/playlist", label: "پلی لیست", icon: Playlist},
        {href: "/", label: "ویترین", icon: Vitrin},
        {href: "/songs", label: "آهنگ ها", icon: Songs},
        {href: "/my-beatbox", label: "بیت باکس من", icon: Playlist},
    ];

    return (
        <div className="bg-[#212121] p-3  right-0 h-screen w-[150px]  hidden lg:fixed z-11">
            <div className="h-full flex flex-col items-center justify-around gap-2">
                {links.map((link, index) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={index}
                            href={link.href}
                            className="flex flex-col items-center justify-center gap-1 group"
                        >
                            <Icon
                                className={`
                                   transition-colors duration-300 
                                    ${isActive ? "text-[#FFEB3B]" : "text-[#7F7F7F]"}
                                  `}
                                style={{ overflow: "visible" ,width:'32px', height:'32px'}}
                            />

                            <span
                                className={`text-[12px] transition ${
                                    isActive ? "text-[#FFEB3B]" : "text-[#7F7F7F]"
                                }`}
                            >
                {link.label}
              </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default RightSidebar;
