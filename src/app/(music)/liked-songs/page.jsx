'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export default function LikedSongsPage() {
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchLikedSongs = async () => {
            try {
                const res = await fetch('/api/liked-songs');
                const data = await res.json();
                setLikedSongs(data.songs);
            } catch (err) {
                setError('خطا در بارگذاری آهنگ‌ها');
            } finally {
                setLoading(false);
            }
        };

        fetchLikedSongs();
    }, []);

    if (loading) {
        return <div>در حال بارگذاری...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white">
            <h1 className="text-3xl mb-5">آهنگ‌های پسند شده</h1>
            <div className="w-full max-w-md mx-auto">
                {likedSongs.map((song, idx) => (
                    <div key={idx} className="flex items-center justify-between mb-4 bg-[#454545] p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <img src={song.thumbnail_url} alt={song.title} className="w-16 h-16 rounded-lg" />
                            <span className="text-xl">{song.title}</span>
                        </div>
                        <button
                            onClick={() => handleLikeToggle(song.id)}
                            className="text-2xl text-[#FFEB3B]"
                        >
                            <Icon icon="solar:heart-linear" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
