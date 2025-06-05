'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Loader from "@/component/Loader";

function VideoPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/video')
            .then((res) => res.json())
            .then((data) => {
                setVideos(data.list || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('❌ خطا در دریافت اطلاعات:', err);
                setLoading(false);
            });
    }, []);


    if (loading) return <Loader />;

    return (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
                <Link
                    key={video.id}
                    href={`/src/app/(music)/video/${video.id}`}
                    className="flex items-center justify-center flex-col overflow-hidden rounded-xl"
                >
                    <Image
                        className="object-cover w-full"
                        src={video.thumbnail_url.replace('http://', 'https://') || '/image/default-thumbnail.jpg'}
                        width={250}
                        height={250}
                        alt={video.title || 'بدون عنوان'}
                    />
                    <span className="text-[#A5A5A5] py-2 text-[13px]">
            {video.title || 'بدون عنوان'}
          </span>
                </Link>
            ))}
        </div>
    );
}

export default VideoPage;
