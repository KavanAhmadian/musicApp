'use client';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function VideoPlayerPage() {
    const id = useSearchParams().get('video_id');
    const [videoUrl, setVideoUrl] = useState('');
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState(''); // برای نام خواننده
    const [thumbnail, setThumbnail] = useState(''); // برای تصویر بندانگشتی خواننده
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch(`/api/videoSingle?video_id=${id}`);
                const data = await res.json();

                if (data.error) {
                    setError(data.error);  // نمایش خطا در صورت دریافت خطا
                } else {
                    setVideoUrl(data?.url || '');
                    setTitle(data?.all?.[0]?.title || 'بدون عنوان');
                    setArtist(data?.all?.[0]?.fard_name || 'ناشناس'); // نام خواننده را دریافت می‌کنیم
                    setThumbnail(data?.all?.[0]?.fard_pic || ''); // تصویر خواننده
                }
            } catch (error) {
                console.error('خطا در دریافت اطلاعات ویدیو', error);
                setError('خطا در دریافت اطلاعات ویدیو');
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    if (loading) return <p>در حال بارگذاری...</p>;
    if (error) return <p>{error}</p>;

    if (!videoUrl) return <p>ویدیو پیدا نشد.</p>;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-neutral-900 rounded-xl shadow-lg">
            {/* بخش آواتار و اطلاعات خواننده */}
            <div className="flex items-center justify-between w-full mb-6">
                <div className="flex items-center">
                    {/* تصویر خواننده */}
                    <img
                        src={thumbnail.replace('http://', 'https://')}
                        alt={artist}
                        className="w-24 h-24 rounded-full shadow-xl mr-4"
                    />
                    {/* نام خواننده و عنوان آهنگ */}
                    <div className={`mx-2`}>
                        <h2 className="text-xl font-semibold text-white">{artist}</h2>
                        <h3 className="text-lg text-white">{title}</h3>
                    </div>
                </div>
            </div>

            {/* پخش ویدیو */}
            <video controls className="w-full max-w-2xl rounded-xl shadow-lg">
                <source src={videoUrl.replace('http://', 'https://')} type="video/mp4" />
                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
            </video>
        </div>
    );
}

export default VideoPlayerPage;
