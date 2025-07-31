'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Loader from '@/component/Loader';

export default function SingleMusicPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const video_id = searchParams.get('video_id');
    const list = searchParams.get('list') || 'last_music';

    const [music, setMusic] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const [showLyrics, setShowLyrics] = useState(false);
    const [authMessage, setAuthMessage] = useState('');

    const audioRef = useRef(null);

    // ✅ Fetch
    const fetchMusic = async (btn = 'Now', vid = video_id) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/singlemusic?video_id=${vid}&list=${list}`);
            const text = await res.text();

            try {
                const result = JSON.parse(text);
                console.log('✅ Server result:', result);

                if (result?.all?.[0]) {
                    setMusic(result.all[0]);
                    setAudioUrl(result.url);
                } else {
                    setMusic(null);
                    setAudioUrl(null);
                }

            } catch (err) {
                console.error("❌ Parse error:", text.slice(0, 300));
                setMusic(null);
                setAudioUrl(null);
            }

        } catch (err) {
            console.error("❌ Fetch error:", err);
            setMusic(null);
            setAudioUrl(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (video_id) fetchMusic();
    }, [video_id, list]);

    // ✅ Audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleCanPlay = () => {
            audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        };
        const updateProgress = () => setProgress(audio.currentTime);

        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('timeupdate', updateProgress);

        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('timeupdate', updateProgress);
        };
    }, [audioUrl]);

    // ✅ Controls
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleSeek = (e) => {
        audioRef.current.currentTime = e.target.value;
    };

    const handleNext = () => {
        if (music?.id) fetchMusic('Next', music.id);
    };
    const handlePrev = () => {
        if (music?.id) fetchMusic('Prev', music.id);
    };

    const handleLike = async () => {
        if (handleAuthRequired()) {
            try {
                const res = await fetch('/api/liked-songs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ songId: music.id }),
                });

                const data = await res.json();
                if (res.ok) {
                    console.log('❤️ آهنگ لایک شد!');
                } else {
                    console.log(data.msg);
                }
            } catch (err) {
                console.error('خطا در لایک کردن آهنگ', err);
            }
        }
    };


    // ✅ چک لاگین
    const handleAuthRequired = () => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('userInfo');
            if (!storedUser || storedUser === 'undefined') {
                setAuthMessage('برای این عملیات باید وارد حساب شوید یا ثبت نام کنید.');
                return false;
            }
        }
        return true;
    };

    // ✅ UI
    if (loading) return <Loader />;

    if (!music) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-white">
                <p>آهنگ پیدا نشد.</p>
                <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-[#FFEB3B] text-black rounded">
                    بازگشت
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-[#121212] text-white">
            {/* Header */}
            <div className="w-full flex items-center justify-between px-4 py-3 mb-5 bg-[#212121]">
                <button onClick={() => router.back()} className="text-[#FFEB3B]">بازگشت</button>

                <button className="flex items-center gap-1" onClick={() => setShowLyrics(true)}>
                    <Icon icon="solar:document-text-linear" className="text-2xl text-[#FFEB3B]" />
                    <span className="text-sm">متن آهنگ</span>
                </button>
            </div>

            {/* Main content */}
            <div className="flex flex-col items-center justify-start px-4 py-2 flex-1 w-full max-w-md mx-auto">
                <Image
                    src={music.thumbnail_url || '/image/default.jpg'}
                    alt={music.title}
                    width={300}
                    height={300}
                    className="rounded-xl mb-4 object-cover"
                />

                <h1 className="text-2xl font-bold mb-1 text-center">{music.title}</h1>
                <h3 className="text-gray-400 mb-6 text-center">{music.fard_name}</h3>

                <div className="flex items-center gap-6 mb-6">
                    <button
                        className="flex items-center gap-1"
                        onClick={() => {
                            if (handleAuthRequired()) {
                                console.log('❤️ پسند شد!');
                            }
                        }}
                    >
                        <Icon icon="solar:heart-linear" className="text-2xl text-[#FFEB3B]" />
                        <span className="text-sm">پسند</span>
                    </button>
                    <button
                        className="flex items-center gap-1"
                        onClick={() => {
                            if (handleAuthRequired()) {
                                console.log('🎵 افزودن به پلی‌لیست!');
                            }
                        }}
                    >
                        <Icon icon="solar:playlist-add-linear" className="text-2xl text-[#FFEB3B]" />
                        <span className="text-sm">افزودن به پلی‌لیست</span>
                    </button>
                    <button className="flex items-center gap-1">
                        <Icon icon="solar:share-linear" className="text-2xl text-[#FFEB3B]" />
                        <span className="text-sm">اشتراک</span>
                    </button>
                </div>

                <input
                    type="range"
                    value={progress}
                    max={duration || 0}
                    onChange={handleSeek}
                    className="w-full accent-[#FFEB3B] mb-4"
                />

                <div className="flex items-center gap-6">
                    <button onClick={handleNext}>
                        <Icon icon="solar:skip-next-outline" className="text-[#FFEB3B] text-3xl" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="p-4 bg-[#FFEB3B] hover:bg-[#C7B40B] rounded-full transition-all"
                    >
                        <Icon
                            icon={isPlaying ? "solar:pause-outline" : "solar:play-linear"}
                            className="text-black text-3xl"
                        />
                    </button>

                    <button onClick={handlePrev}>
                        <Icon icon="solar:skip-previous-outline" className="text-[#FFEB3B] text-3xl" />
                    </button>
                </div>

                <audio
                    ref={audioRef}
                    src={audioUrl || undefined}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />
            </div>

            {/* Modal for lyrics */}
            {showLyrics && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#212121] rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6 relative shadow-xl">
                        <button
                            onClick={() => setShowLyrics(false)}
                            className="absolute top-3 left-3 text-[#FFEB3B] text-xl"
                        >
                            <Icon icon="solar:close-circle-outline" />
                        </button>
                        <h3 className="text-xl font-bold mb-4 text-[#FFEB3B] text-center">متن آهنگ</h3>
                        <pre className="whitespace-pre-wrap text-gray-300 text-sm">{music.des || "متنی موجود نیست."}</pre>
                    </div>
                </div>
            )}

            {/* Auth Message Toast */}
            {authMessage && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#FFEB3B] text-black px-4 py-2 rounded-lg shadow-lg z-[9999] transition-all duration-300">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm">{authMessage}</span>
                        <button
                            onClick={() => setAuthMessage('')}
                            className="text-black text-lg"
                        >
                            <Icon icon="solar:close-circle-outline" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
