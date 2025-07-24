'use client';
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Loader from "@/component/Loader";

const API_URL = '/api/playlists';

// Reusable slider component
const UserSlider = ({ title, users ,   fatherID }) => {
    if (!users || users.length === 0) return null;

    const secureImageUrl = (url) => {
        return url ? url.replace(/^http:\/\//, 'https://') : '/default.jpg';
    };

    return (
        <div className="my-4">
            <div className="flex justify-between items-center">
                <h3 className="text-[18px]">{title}</h3>
                <Link
                    className="flex gap-2 items-center hover:text-[#ffeb3b]"
                    href={`/lists?father=${fatherID}`}
                >
                    <span>بیشتر</span>
                    <Icon icon="solar:arrow-left-outline" />
                </Link>



            </div>
            <div className="my-2">
                <Swiper
                    spaceBetween={10}
                    breakpoints={{
                        320: { slidesPerView: 4 },
                        480: { slidesPerView: 5 },
                        768: { slidesPerView: 6 },
                        1024: { slidesPerView: 7 },
                    }}
                >
                    {users.map((user, index) => (
                        <SwiperSlide key={index}>
                            <Link
                                href={`/listsongs?list_id=${user.id}`}
                                className="flex flex-col items-center justify-center group relative gap-2 min-h-[140px]"
                            >
                                <Image
                                    src={secureImageUrl(user.image)}
                                    alt={user.name}
                                    width={166}
                                    height={166}
                                    className="rounded-xl w-full "
                                    loading="lazy"
                                />
                                <span className="text-white flex items-center justify-center w-full h-full text-sm absolute top-0 right-0 left-0 bg-black/30">
                                    {user.name}
                                </span>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

function SongsPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Data fetch error');
                const json = await response.json();
                setData(json.all || []);
                setLoading(false);

            } catch (error) {
                // console.error('Error fetching data', error);
                setError(true);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Loader />;
    if (error) return (
        <div className="text-center text-red-500 py-10">
            <p>خطا در دریافت اطلاعات</p>
            <button onClick={() => window.location.reload()} className="text-blue-500 mt-2">تلاش مجدد</button>
        </div>
    );

    return (
        <div className="w-full py-2">
            {data.map((playlist, index) => (
                <UserSlider
                    key={index}
                    fatherID={playlist.father_id}
                    title={playlist.father_title || `پلی‌لیست ${index + 1}`}
                    users={playlist.lists.map(item => ({
                        name: item.title || 'بدون نام',
                        image: item.thumbnail_url || '/default.jpg',
                        id: item.id
                    }))}
                />
            ))}
        </div>
    );
}

export default SongsPage;
