"use client";

import SectionTitle from "@/component/SectionTitle";
import Image from "next/image";
import NextNProgress from 'nextjs-progressbar';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import Link from "next/link";
import React, {useEffect, useState} from "react";

export default function Home() {
    const [sliderSections, setSliderSections] = useState([]);

    useEffect(() => {
        fetch('/api/home')
            .then(res => res.json())
            .then(data => {
                const filtered = data.all.filter(item => item.title_list && item.title_list.trim() !== "");
                setSliderSections(filtered);
            });
    }, []);

    return (
        <>
            <NextNProgress color="#29D" startPosition={0.3} stopDelayMs={200} height={3}/>

            {sliderSections.map((section, index) => (
                <div key={index}>
                    <SectionTitle title_list={section.title_list}/>
                    <div className="py-4">
                        <Swiper
                            spaceBetween={60}
                            breakpoints={{
                                320: {slidesPerView: 4},
                                480: {slidesPerView: 5},
                                768: {slidesPerView: 6},
                                1024: {slidesPerView: 7},
                            }}
                            scrollbar={{draggable: true}}
                        >
                            {section.list.map((user, i) => (
                                <SwiperSlide key={i}>
                                    <Link
                                        href={`/signer?id=${user.id}`}
                                        className="flex flex-col items-center justify-center gap-2 min-h-[140px] w-[110px]"
                                    >
                                        <Image
                                            src={user.pic1 || "/fallback.jpg"}
                                            alt={user.title || "بدون عنوان"}
                                            width={100}
                                            height={100}
                                            className="rounded-full object-cover object-center"
                                            loading="lazy"
                                            style={{ width: 100, height: 100 }}
                                        />
                                        <span
                                            className="text-white text-sm text-center truncate w-full block"
                                            title={user.title || "بدون عنوان"}
                                        >
                                          {user.title || "بدون عنوان"}
                                        </span>
                                    </Link>
                                </SwiperSlide>

                            ))}
                        </Swiper>
                    </div>
                </div>
            ))}
        </>
    );
}
