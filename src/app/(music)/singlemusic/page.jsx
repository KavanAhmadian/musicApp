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

    const [playlist, setPlaylist] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trackLoading, setTrackLoading] = useState(false); // وضعیت loading جدید برای تغییر ترک
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showLyrics, setShowLyrics] = useState(false);
    const [authMessage, setAuthMessage] = useState('');

    const audioRef = useRef(null);

    // گرفتن لیست آهنگ‌ها
    const fetchMusic = async (btn = 'Now', vid = video_id) => {
        setLoading(true);
        try {
            const url = `/api/singlemusic?video_id=${vid}&btn=${btn}&list=${list}`;
            const res = await fetch(url);
            const text = await res.text();

            try {
                const result = JSON.parse(text);
                if (result?.all?.length) {
                    setPlaylist(result.all);
                    setCurrentTrack(result.all[0]);
                    setAudioUrl(result.url);
                } else {
                    setPlaylist([]);
                    setCurrentTrack(null);
                    setAudioUrl(null);
                }
            } catch (err) {
                console.error("❌ Parse error:", text.slice(0, 300));
                setPlaylist([]);
                setCurrentTrack(null);
                setAudioUrl(null);
            }
        } catch (err) {
            console.error("❌ Fetch error:", err);
            setPlaylist([]);
            setCurrentTrack(null);
            setAudioUrl(null);
        } finally {
            setLoading(false);
        }
    };

    // گرفتن لینک پخش برای ترک فعلی
    const fetchAudioUrl = async (track) => {
        setTrackLoading(true);
        setProgress(0); // ریست کردن پیشرفت
        setIsPlaying(false); // توقف پخش فعلی

        try {
            const res = await fetch(`/api/play?video_id=${track.id}&list=${list}`);
            const contentType = res.headers.get("content-type");

            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                setAudioUrl(data.url || null);
                setCurrentTrack(track);
            } else {
                const text = await res.text();
                console.warn("⚠️ پاسخ JSON نبود:\n", text.slice(0, 300));
                throw new Error("پاسخ معتبر JSON نبود.");
            }
        } catch (err) {
            console.error("⛔ خطا در دریافت لینک پخش:", err.message);
            setAudioUrl(null);
        } finally {
            setTrackLoading(false);
        }
    };

    useEffect(() => {
        if (video_id) fetchMusic();
    }, [video_id, list]);

    // مدیریت صدا
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        const handleCanPlay = () => {
            // وقتی صدا آماده پخش است، به طور خودکار پخش شود
            audio.play().then(() => {
                setIsPlaying(true);
                setTrackLoading(false);
            }).catch((err) => {
                console.error("خطا در پخش صدا:", err);
                setIsPlaying(false);
                setTrackLoading(false);
            });
        };

        const updateProgress = () => setProgress(audio.currentTime);
        const handleEnded = () => handleNext(); // وقتی آهنگ تمام شد، آهنگ بعدی پخش شود

        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    // کنترل پخش
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
        if (audioRef.current) {
            audioRef.current.currentTime = e.target.value;
            setProgress(e.target.value);
        }
    };

    const handlePrev = () => {
        if (!playlist.length || !currentTrack) return;
        const currentIndex = playlist.findIndex(m => m.id === currentTrack.id);
        const prevTrack = playlist[currentIndex - 1];
        if (prevTrack) {
            fetchAudioUrl(prevTrack);
        }
    };

    const handleNext = () => {
        if (!playlist.length || !currentTrack) return;
        const currentIndex = playlist.findIndex(m => m.id === currentTrack.id);
        const nextTrack = playlist[currentIndex + 1];
        if (nextTrack) {
            fetchAudioUrl(nextTrack);
        }
    };


    const handleDownload = () => {
        if (audioUrl && currentTrack) {
            const link = document.createElement("a");
            link.href = audioUrl;
            link.download = `${currentTrack.title || "track"}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // چک لاگین
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

    // UI
    if (loading) return <Loader />;

    if (!currentTrack) {
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
                {trackLoading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                        <Loader />
                    </div>
                )}

                <Image
                    src={currentTrack.thumbnail_url || '/image/default.jpg'}
                    alt={currentTrack.title}
                    width={300}
                    height={300}
                    className="rounded-xl mb-4 object-cover"
                />

                <h1 className="text-2xl font-bold mb-1 text-center">{currentTrack.title}</h1>
                <h3 className="text-gray-400 mb-6 text-center">{currentTrack.fard_name}</h3>

                <div className="flex items-center gap-6 mb-6">
                    <button
                        className="flex items-center gap-1"
                        onClick={() => handleAuthRequired() && console.log('❤️ پسند شد!')}
                    >
                        <Icon icon="solar:heart-linear" className="text-2xl text-[#FFEB3B]" />
                        <span className="text-sm">پسند</span>
                    </button>
                    <button
                        className="flex items-center gap-1"
                        onClick={() => handleAuthRequired() && console.log('🎵 افزودن به پلی‌لیست!')}
                    >
                        <Icon icon="solar:playlist-add-linear" className="text-2xl text-[#FFEB3B]" />
                        <span className="text-sm">افزودن به پلی‌لیست</span>
                    </button>
                    <button className="flex items-center gap-1">
                        <Icon icon="solar:share-linear" className="text-2xl text-[#FFEB3B]" />
                        <span className="text-sm">اشتراک</span>
                    </button>
                    <button onClick={handleDownload}
                            disabled={!audioUrl} className="flex items-center gap-1 cursor-pointer">
                        <Icon icon="solar:arrow-down-linear" className="text-2xl text-[#FFEB3B]"/>
                        <span className="text-sm">دانلود</span>
                    </button>
                </div>

                <div className="w-full flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>{new Date(progress * 1000).toISOString().substr(14, 5)}</span>
                    <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
                </div>

                <input
                    type="range"
                    value={progress}
                    max={duration || 0}
                    onChange={handleSeek}
                    className="w-full accent-[#FFEB3B] mb-4"
                />

                <div className="flex items-center gap-6">
                    <button
                        onClick={handlePrev}
                        disabled={!playlist.length || playlist.findIndex(m => m.id === currentTrack.id) === 0}
                        className={!playlist.length || playlist.findIndex(m => m.id === currentTrack.id) === 0 ? "opacity-50" : ""}
                    >
                        <Icon icon="solar:skip-previous-outline" className="text-[#FFEB3B] text-3xl" />
                    </button>

                    <button
                        onClick={togglePlay}
                        disabled={trackLoading || !audioUrl}
                        className="p-4 bg-[#FFEB3B] hover:bg-[#C7B40B] rounded-full transition-all disabled:opacity-50"
                    >
                        {trackLoading ? (
                            <div className="w-6 h-6 border-t-2 border-black border-solid rounded-full animate-spin"></div>
                        ) : (
                            <Icon
                                icon={isPlaying ? "solar:pause-outline" : "solar:play-linear"}
                                className="text-black text-3xl"
                            />
                        )}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!playlist.length || playlist.findIndex(m => m.id === currentTrack.id) === playlist.length - 1}
                        className={!playlist.length || playlist.findIndex(m => m.id === currentTrack.id) === playlist.length - 1 ? "opacity-50" : ""}
                    >
                        <Icon icon="solar:skip-next-outline" className="text-[#FFEB3B] text-3xl" />
                    </button>
                </div>

                <audio
                    ref={audioRef}
                    src={audioUrl || undefined}
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
                        <pre className="whitespace-pre-wrap text-gray-300 text-sm">{currentTrack.des || "متنی موجود نیست."}</pre>
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