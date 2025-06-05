"use client";

import React from 'react';
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Link from "next/link";

const users = [
    { name: "معین", image: "/image/moin.jpg" },
    { name: "معین", image: "/image/moin.jpg" },
    { name: "معین", image: "/image/moin.jpg" },
    { name: "معین", image: "/image/moin.jpg" },
    { name: "معین", image: "/image/moin.jpg" },
    { name: "معین", image: "/image/moin.jpg" },
    { name: "معین", image: "/image/moin.jpg" },
    { name: "معین", image: "/image/moin.jpg" },
];

function SliderCarousel() {
    return (
        <div className="py-4">
            <Swiper
                spaceBetween={20}
                breakpoints={{
                    320: { slidesPerView: 4 },
                    480: { slidesPerView: 5 },
                    768: { slidesPerView: 6 },
                    1024: { slidesPerView: 7 },
                }}
                scrollbar={{ draggable: true }}
            >
                {users.map((user, index) => (
                    <SwiperSlide key={index}>
                        <Link
                            href="/"
                            className="flex flex-col items-center justify-center gap-2 min-h-[140px]"
                        >
                            <Image
                                src={user.image}
                                alt={user.name}
                                width={100}
                                height={100}
                                className="rounded-full"
                                loading="lazy"
                            />
                            <span className="text-white text-sm">{user.name}</span>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default SliderCarousel;
