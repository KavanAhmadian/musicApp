'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LuMusic4 } from 'react-icons/lu';
import { Icon } from '@iconify/react';
import { IoFlameOutline } from 'react-icons/io5';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiPlayReverseLargeLine } from 'react-icons/ri';
import Image from 'next/image';
import Loader from '@/component/Loader';
import AddToPlaylistWidget from "@/component/AddToPlaylistWidget";
import LoginModal from "@/component/LoginModal";
import { FaHeart, FaRegHeart } from "react-icons/fa";


/* ---------- helpers ---------- */
function fmtTime(s) {
    return new Date((s || 0) * 1000).toISOString().substr(14, 5);
}
async function safePlay(audio) {
    if (!audio) return false;
    try {
        await audio.play();
        return true;
    } catch (e) {
        if (e?.name !== 'AbortError') console.warn('play failed:', e?.message);
        return false;
    }
}


function FullscreenPlayer({
                              open,
                              onClose,
                              track,
                              isPlaying,
                              progress,
                              duration,
                              onSeek,
                              onPlayPause,
                              onPrev,
                              onNext,
                              onDownload,
                          }) {
    const [showLyrics, setShowLyrics] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        if (!track?.id) return;
        const likedTracks = JSON.parse(localStorage.getItem("likedTracks") || "[]");
        if (likedTracks.includes(track.id)) {
            setLiked(true);
        } else {
            setLiked(false);
        }
    }, [track?.id]);


    if (!open || !track) return null;


    const handleLike = async () => {
        if (!track?.id) return;

        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userName = userInfo.phone;

        if (!userName) {
            setLoginModalOpen(true);
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
                            onClick={handleLike}
                        >
                            {liked ?  <Icon icon="solar:heart-bold" className="text-2xl text-[#FFEB3B]" /> :  <Icon icon="solar:heart-linear" className="text-2xl text-[#FFEB3B]" />}
                            <span className="text-sm">پسند</span>
                        </button>


                        <LoginModal
                            isOpen={loginModalOpen}
                            onClose={() => setLoginModalOpen(false)}
                        />

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
        </div>
    );
}



/* =========================
   Main Page (PlayListPage)
   ========================= */
export default function PlayListPage() {
    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('last_music');


    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);


    const [currentTrack, setCurrentTrack] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);


    const [playerOpen, setPlayerOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/music', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        what_list: type,
                        key: 'sdifu4530dsf98sf0sdf',
                        action: 'list_music',
                        pageno: '1',
                    }),
                });
                const json = await res.json();
                setMusicList(Array.isArray(json.all) ? json.all : []);
                setLoading(false);
            } catch (err) {
                console.error('❌ خطا در دریافت:', err.message);
                setMusicList([]);
                setLoading(false);
            }
        };
        fetchData();
    }, [type]);


    useEffect(() => {
        if (!currentTrack) return;
        (async () => {
            try {
                const res = await fetch(`/api/play?video_id=${currentTrack.id}&list=${type}`);
                const contentType = res.headers.get('content-type') || '';
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                if (!contentType.includes('application/json')) {
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Unexpected content-type: ${contentType}. Body: ${txt.slice(0, 300)}`);
                }
                const data = await res.json();
                setAudioUrl(data?.url || null);
            } catch (err) {
                console.error('⛔ mini play url error:', err.message);
                setAudioUrl(null);
            }
        })();
    }, [currentTrack, type]);


    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        (async () => {
            const ok = await safePlay(audio);
            setIsPlaying(ok);
        })();

        const onTime = () => setProgress(audio.currentTime || 0);
        const onLoaded = () => setDuration(audio.duration || 0);
        const onEnded = () => {

            const idx = musicList.findIndex((m) => String(m.id) === String(currentTrack?.id));
            const next = idx > -1 ? musicList[idx + 1] : null;
            if (next) setCurrentTrack(next);
            else setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('ended', onEnded);
        };
    }, [audioUrl, musicList, currentTrack]);


    const handleTrackClick = (music) => {
        setCurrentTrack(music);
        setIsPlaying(true);
    };


    const openFullscreenFor = (music) => {
        setCurrentTrack(music);
        setIsPlaying(true);
        setPlayerOpen(true);
    };


    const openFullscreenFromMini = () => setPlayerOpen(true);

    const handleNextTrack = () => {
        if (!currentTrack) return;
        const currentIndex = musicList.findIndex((m) => String(m.id) === String(currentTrack.id));
        const next = musicList[currentIndex + 1];
        if (next) setCurrentTrack(next);
    };

    const handlePrevTrack = () => {
        if (!currentTrack) return;
        const currentIndex = musicList.findIndex((m) => String(m.id) === String(currentTrack.id));
        const prev = musicList[currentIndex - 1];
        if (prev) setCurrentTrack(prev);
    };

    const handleSeek = (val) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Number(val);
        setProgress(Number(val));
    };

    const togglePlayPause = async () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            const ok = await safePlay(audio);
            setIsPlaying(ok);
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    };

    const downloadCurrent = () => {
        if (!audioUrl || !currentTrack) return;
        const a = document.createElement('a');
        a.href = audioUrl;
        a.setAttribute('download', `${currentTrack.title || 'track'}.mp3`);
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const downloadTrack = async (track) => {
        try {
            const res = await fetch(`/api/play?video_id=${track.id}&list=${type}`);
            const ct = res.headers.get('content-type') || '';
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            if (!ct.includes('application/json')) {
                const txt = await res.text().catch(() => '');
                throw new Error(`Unexpected content-type: ${ct}. Body: ${txt.slice(0, 300)}`);
            }
            const data = await res.json();
            if (!data?.url) return;
            const a = document.createElement('a');
            a.href = data.url;
            a.setAttribute('download', `${track.title || 'track'}.mp3`);
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            console.error('📥 دانلود ناموفق:', e.message);
        }
    };

    return (
        <div>
            {!mounted ? null : (
                <>
                    {/* Filter Buttons */}
                    <div className="flex items-center justify-center gap-12 py-2 bg-[#212121] mb-4">
                        <button onClick={() => setType('last_music')} className="text-white font-light flex items-center gap-1 cursor-pointer">
                            <LuMusic4 className="text-xl" /> جدیدها
                        </button>
                        <button onClick={() => setType('list_hot')} className="text-white font-light flex items-center gap-1 cursor-pointer">
                            <IoFlameOutline className="text-xl" /> داغ ها
                        </button>
                        <button onClick={() => setType('list_view')} className="text-white font-light flex items-center gap-1 cursor-pointer">
                            <MdOutlineRemoveRedEye className="text-xl" /> پربازدیدها
                        </button>
                    </div>

                    {/* Music List */}
                    <div className="flex items-center justify-center flex-col gap-3">
                        {loading ? (
                            <Loader />
                        ) : (
                            musicList.map((music, index) => (
                                <div
                                    key={music.id ?? `fallback-${music.title}-${index}`}
                                    className={`flex items-center justify-between rounded-2xl ${
                                        index % 2 === 0 ? 'bg-gradient-to-r from-[#2E2E2E] to-[#151515]' : 'bg-gradient-to-r from-[#151515] to-[#2E2E2E]'
                                    } py-1 w-full cursor-pointer hover:bg-[#2a2a2a] transition`}
                                    onClick={() => handleTrackClick(music)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={music.thumbnail_url || '/image/default.jpg'}
                                            className="rounded-xl object-cover cursor-pointer"
                                            alt={music.title || 'music'}
                                            height={80}
                                            width={80}
                                        />
                                        <div className="flex flex-col">
                                            <h3 className="text-[20px] text-white cursor-pointer">{music.title || 'بدون عنوان'}</h3>
                                            <h6 className="text-[14px] text-[#6e6e6e]">{music.fard_name || 'نامشخص'}</h6>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mx-4">

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadTrack(music);
                                            }}
                                            title="دانلود"
                                            className="p-1"
                                        >
                                            <Icon icon="solar:download-minimalistic-bold" className="text-white text-2xl" />
                                        </button>


                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openFullscreenFor(music);
                                            }}
                                            className="p-1"
                                            title="پخش تمام‌صفحه"
                                        >
                                            <RiPlayReverseLargeLine className="text-white text-2xl cursor-pointer" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>


                    {currentTrack && audioUrl && (
                        <div className="fixed bottom-[78px] z-[9910] duration-150 transition-all lg:bottom-0 left-0 right-0 bg-gradient-to-r to-[#4e4e4e] from-[#323230] bg-[#1a1a1a] text-white px-4 py-2 flex flex-col items-center shadow-lg border-t border-gray-800">
                            <div className="w-full flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Image src={currentTrack.thumbnail_url || '/image/default.jpg'} width={50} height={50} alt={currentTrack.title} className="rounded" />
                                    <div>
                                        <h4 className="text-white text-sm font-semibold mb-2">{currentTrack.title}</h4>
                                        <p className="text-xs text-gray-400">{currentTrack.fard_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">

                                    <button onClick={openFullscreenFromMini} title="تمام‌صفحه" className="rounded-full p-2 hover:bg-white/10">
                                        <Icon icon="solar:maximize-square-linear" className="text-[#e0e0e0]" style={{ width: 24, height: 24 }} />
                                    </button>

                                    <button onClick={handleNextTrack} title="بعدی">
                                        <Icon icon="solar:skip-next-outline" className="text-[#7F7F7F]" style={{ width: '32px', height: '32px' }} />
                                    </button>
                                    <button
                                        onClick={togglePlayPause}
                                        title={isPlaying ? 'مکث' : 'پخش'}
                                    >
                                        <div className="p-4 bg-[#FF9766] hover:bg-[#FF6855] rounded-full transition-all">
                                            <Icon icon={isPlaying ? 'solar:pause-outline' : 'solar:play-linear'} className="text-white" style={{ fontSize: 24 }} />
                                        </div>
                                    </button>
                                    <button onClick={handlePrevTrack} title="قبلی">
                                        <Icon icon="solar:skip-previous-outline" className="text-[#7F7F7F]" style={{ width: '32px', height: '32px' }} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const audio = audioRef.current;
                                            if (audio) {
                                                audio.pause();
                                                audio.currentTime = 0;
                                            }
                                            setCurrentTrack(null);
                                            setAudioUrl(null);
                                            setIsPlaying(false);
                                        }}
                                        title="بستن"
                                    >
                                        <Icon icon="solar:close-circle-outline" className="text-[#7F7F7F]" style={{ width: '32px', height: '32px' }} />
                                    </button>
                                </div>
                            </div>
                            <div className="w-full mt-2">
                                <input
                                    type="range"
                                    value={progress}
                                    max={duration || 0}
                                    onChange={(e) => handleSeek(e.target.value)}
                                    className="w-full accent-[#FF9766]"
                                />
                            </div>

                            <audio ref={audioRef} src={audioUrl || undefined} className="hidden" />
                        </div>
                    )}


                    <FullscreenPlayer
                        open={playerOpen}
                        onClose={() => setPlayerOpen(false)}
                        track={currentTrack}
                        isPlaying={isPlaying}
                        progress={progress}
                        duration={duration}
                        onSeek={handleSeek}
                        onPlayPause={togglePlayPause}
                        onPrev={handlePrevTrack}
                        onNext={handleNextTrack}
                        onDownload={downloadCurrent}
                    />
                </>
            )}
        </div>
    );
}
