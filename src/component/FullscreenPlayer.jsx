'use client';
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import AddToPlaylistWidget from "@/component/AddToPlaylistWidget";
import LoginModal from "@/component/LoginModal";


function fmtTime(s) {
    return new Date((s || 0) * 1000).toISOString().substr(14, 5);
}

export default function FullscreenPlayer({ open, onClose, track, isPlaying, progress, duration, onSeek, onPlayPause, onPrev, onNext, onDownload }) {
    const [showLyrics, setShowLyrics] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [liked, setLiked] = useState(false);


    useEffect(() => {
        if (!track?.id) return;
        const likedTracks = JSON.parse(localStorage.getItem("likedTracks") || "[]");
        setLiked(likedTracks.includes(track.id));
    }, [track?.id]);

    if (!open || !track) return null;

    const handleLike = async () => {
        if (!track?.id) return;
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userName = userInfo.phone;
        if (!userName) {
            setLoginModalOpen(true);  // باز کردن مدال ورود
            return;
        }
        try {
            const res = await fetch("/api/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_name: userName, id: track.id }),
            });
            const data = await res.json();
            if (Array.isArray(data) && data[0]?.state === "T") {
                setLiked(true);
                const likedTracks = JSON.parse(localStorage.getItem("likedTracks") || "[]");
                if (!likedTracks.includes(track.id)) {
                    likedTracks.push(track.id);
                    localStorage.setItem("likedTracks", JSON.stringify(likedTracks));
                }
            }
        } catch (err) {
            console.error("❌ خطا:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[9998]">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute inset-x-0 bottom-0 top-0 md:top-auto md:h-[90vh] h-full bg-[#121212] text-white rounded-t-2xl shadow-2xl z-[9999] flex flex-col">
                {/* Header */}
                <div className="w-full flex items-center justify-between px-4 py-3 mb-2 bg-[#212121] rounded-t-2xl">
                    <button onClick={onClose} className="text-[#FFEB3B]">بستن</button>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1" onClick={() => setShowLyrics(true)}>
                            <Icon icon="solar:document-text-linear" className="text-2xl text-[#FFEB3B]" />
                            <span className="text-sm">متن آهنگ</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center justify-start px-4 py-2 flex-1 w-full max-w-md mx-auto">
                    <Image
                        src={track.thumbnail_url || '/image/default.jpg'}
                        alt={track.title || 'track'}
                        width={300}
                        height={300}
                        className="rounded-xl mb-4 object-cover"
                    />
                    <h1 className="text-2xl font-bold mb-1 text-center">{track.title}</h1>
                    <h3 className="text-gray-400 mb-6 text-center">{track.fard_name}</h3>
                    <div className="flex items-center gap-6 mb-6">
                        <button
                            className="flex items-center gap-1 cursor-pointer"

                        >
                            <Icon icon="solar:heart-fill" className="text-2xl text-[#FFEB3B]" />
                            <span className="text-sm"> پسند شده </span>
                        </button>

                        <AddToPlaylistWidget
                            videoId={track?.id}
                            trigger={
                                <button className="flex items-center gap-1 cursor-pointer">
                                    <Icon icon="solar:playlist-minimalistic-3-outline" className="text-2xl text-[#FFEB3B]" />
                                    <span className="text-sm">افزودن به پلی‌لیست</span>
                                </button>
                            }
                        />

                        <button className="flex items-center gap-1 cursor-pointer" >
                            <Icon icon="solar:share-linear" className="text-2xl text-[#FFEB3B]" />
                            <span className="text-sm">اشتراک</span>
                        </button>
                        <button className="flex items-center gap-1 cursor-pointer" onClick={onDownload}>
                            <Icon icon="solar:download-minimalistic-bold" className="text-2xl text-[#FFEB3B]" />
                            <span className="text-sm">دانلود</span>
                        </button>
                    </div>
                    <div className="w-full flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>{fmtTime(progress)}</span>
                        <span>{fmtTime(duration)}</span>
                    </div>

                    <input
                        type="range"
                        value={progress}
                        max={duration || 0}
                        onChange={(e) => onSeek(Number(e.target.value))}
                        className="w-full accent-[#FFEB3B] mb-4"
                    />

                    <div className="flex items-center gap-6">
                        <button onClick={onNext} title="بعدی">
                            <Icon icon="solar:skip-next-outline" className="text-[#FFEB3B] text-3xl" />
                        </button>

                        <button
                            onClick={onPlayPause}
                            className="p-4 bg-[#FFEB3B] hover:bg-[#C7B40B] rounded-full transition-all"
                            title={isPlaying ? 'مکث' : 'پخش'}
                        >
                            <Icon icon={isPlaying ? 'solar:pause-outline' : 'solar:play-linear'} className="text-black text-3xl" />
                        </button>

                        <button onClick={onPrev} title="قبلی">
                            <Icon icon="solar:skip-previous-outline" className="text-[#FFEB3B] text-3xl" />
                        </button>
                    </div>
                </div>

                {/* Lyrics */}
                {showLyrics && (
                    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-[#212121] rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6 relative shadow-xl">
                            <button onClick={() => setShowLyrics(false)} className="absolute top-3 left-3 text-[#FFEB3B] text-xl">
                                <Icon icon="solar:close-circle-outline" />
                            </button>
                            <h3 className="text-xl font-bold mb-4 text-[#FFEB3B] text-center">متن آهنگ</h3>
                            <pre className="whitespace-pre-wrap text-gray-300 text-sm">
                                {(track?.des && String(track.des).trim()) || 'متنی موجود نیست.'}
                            </pre>
                        </div>
                    </div>
                )}
            </div>


            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </div>
    );
}
