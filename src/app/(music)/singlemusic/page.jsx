'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MusicPlayer() {
    const [music, setMusic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);
    const searchParams = useSearchParams();
    const videoId = searchParams.get('video_id');
console.log(music);
    useEffect(() => {
        if (!videoId) {
            setError('شناسه ویدیو یافت نشد');
            setLoading(false);
            return;
        }

        fetch('/api/singlemusic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: 'sdifu4530dsf98sf0sdf',
                action: 'link_play',
                videoID: videoId,
                what_list: 'last_music',
                btn: 'Now',
            }),
        })
            .then(res => {
                if (!res.ok) throw new Error('خطا در دریافت اطلاعات');
                return res.json();
            })
            .then(data => {
                if (!data?.url || !data.url.match(/\.(mp3|wav|ogg|m4a)/i)) {
                    throw new Error('فرمت صدا پشتیبانی نمی‌شود');
                }
                if (data?.all?.length > 0) {
                    setMusic({ ...data.all[0], url: encodeURI(data.url) });

                } else {
                    throw new Error('اطلاعات موزیک یافت نشد');
                }
                setError(null);
            })
            .catch(err => {
                setError(err.message);
                console.error('Error:', err);
            })
            .finally(() => setLoading(false));
    }, [videoId]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleCanPlay = () => setIsAudioReady(true);
        const handleError = () => {
            setIsAudioReady(false);
            setError('خطا در پخش صوت');
        };
        const handleEnd = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnd);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('ended', handleEnd);
        };
    }, [music]);

    const togglePlay = () => {
        if (!audioRef.current || !isAudioReady) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play()
                .catch(err => {
                    console.error('Playback failed:', err);
                    setError('پخش صوت امکان‌پذیر نیست');
                    setIsAudioReady(false);
                });
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = e => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = t => {
        if (isNaN(t)) return '0:00';
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center bg-black min-h-screen text-white p-4">
                <div className="animate-pulse rounded-full bg-gray-800 w-64 h-64 mb-4"></div>
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
                <div className="text-center">در حال بارگذاری...</div>
            </div>
        );
    }

    if (error || !music) {
        return (
            <div className="flex flex-col items-center justify-center bg-black min-h-screen text-white p-4">
                <div className="text-red-500 text-lg mb-4">خطا!</div>
                <div className="text-center mb-4">{error || 'موزیک یافت نشد'}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-orange-500 px-4 py-2 rounded-full"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center bg-black min-h-screen text-white p-4">
            <div className="w-64 h-64 bg-gray-800 rounded-xl overflow-hidden mt-4">
                <img
                    src={music.thumbnail_url || '/default.jpg'}
                    alt="cover"
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = '/default.jpg'}
                />
            </div>

            <div className="bg-black/80 rounded-full px-6 py-3 mt-4 flex items-center justify-between w-80">
                <div>
                    <div className="text-lg font-bold truncate max-w-[180px]">
                        {music.title || 'عنوان نامعلوم'}
                    </div>
                    <div className="text-sm text-gray-400">
                        {music.fard_name || 'هنرمند نامعلوم'}
                    </div>
                </div>
                <img
                    src={music.fard_pic || '/default.jpg'}
                    alt="artist"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => e.target.src = '/default.jpg'}
                />
            </div>

            <div className="w-full mt-6">
                <div className="flex h-16 gap-1 items-end justify-center">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-orange-400 rounded"
                            style={{
                                height: `${isPlaying ? Math.random() * 40 + 10 : 10}px`,
                                transition: 'height 0.2s ease-in-out'
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between text-xs mt-2 px-2">
                    <span>{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        className="w-full mx-2 accent-orange-500"
                        value={currentTime}
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        onChange={handleSeek}
                        disabled={!isAudioReady}
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-6 w-4/5">
                <button className="opacity-50">🔇</button>
                <button className="opacity-50">⏮️</button>
                <button
                    onClick={togglePlay}
                    disabled={!isAudioReady}
                    className={`p-4 rounded-full text-white text-xl ${isAudioReady ? 'bg-orange-500' : 'bg-gray-600'}`}
                >
                    {isPlaying ? '⏸️' : '▶️'}
                </button>
                <button className="opacity-50">⏭️</button>
                <button className="opacity-50">🔁</button>
            </div>

            <audio
                ref={audioRef}
                src={encodeURI(music.url)}
                preload="auto"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={(e) => {
                    console.error("Audio error:", e.target.error);
                    setError('خطا در بارگذاری صوت');
                    setIsAudioReady(false);
                }}
            />
        </div>
    );
}