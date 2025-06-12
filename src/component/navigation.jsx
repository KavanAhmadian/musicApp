"use client";

import React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import { Icon } from "@iconify/react";



function Navigation() {
    const pathname = usePathname();

    const links = [{href: "/video", label: "موزیک ویدیو", icon: 'solar:clapperboard-open-play-linear'}, {
        href: "/playlist", label: "پلی لیست", icon: 'solar:playlist-minimalistic-3-linear',
    }, {href: "/", label: "ویترین", icon: 'solar:widget-linear'}, {
        href: "/songs", label: "آهنگ ها", icon: 'solar:music-note-slider-linear',
    }, {href: "/my-beatbox", label: "بیت باکس من", icon: 'solar:playlist-minimalistic-3-linear'},];

    return (<div
        className="bg-[#212121] z-[89] p-3 fixed bottom-0 w-full lg:static lg:w-32 lg:h-screen lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="flex justify-around gap-2 mx-auto sm:w-full md:w-full lg:flex-col lg:gap-10">

            {links.map((link, index) => {
                const isActive = pathname === link.href;


                return (<Link
                    key={index}
                    href={link.href}
                    className="flex flex-col items-center justify-center gap-1 group"
                >
                    <Icon
                        icon={link.icon}
                        className={`transition-colors duration-300 ${isActive ? "text-[#FFEB3B]" : "text-[#7F7F7F]"}`}
                        style={{width: "32px", height: "32px"}}
                    />
                    <span
                        className={`text-[12px] transition ${isActive ? "text-[#FFEB3B]" : "text-[#7F7F7F]"} block text-center`}
                    >
                {link.label}
              </span>
                </Link>);
            })}
        </div>
    </div>);
}

export default Navigation;
