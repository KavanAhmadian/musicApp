'use client';
import React, { useEffect, useState, useRef } from 'react';
import { RiPlayReverseLargeLine } from 'react-icons/ri';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Loader from '@/component/Loader';
import FullscreenPlayer from '@/component/FullscreenPlayer';

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

export default function PlayListPage() {
    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('last_music');

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);


    const [userName, setUserName] = useState(null);
    useEffect(() => {
        const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setUserName(info.phone || null);
    }, []);


    const [currentTrack, setCurrentTrack] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);


    const [playerOpen, setPlayerOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            if (!userName) return;
            setLoading(true);
            try {
                const res = await fetch('/api/liked-songs-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        act: 'Liked_Musics',
                        key: 'pewTri54tboYEiirt8topiesf15',
                        action: 'show',
                        pageno: '1',
                        user_name: userName,
                    }),
                });
                const json = await res.json();
                setMusicList(Array.isArray(json.list || json.all) ? (json.list || json.all) : []);
            } catch (err) {
                console.error('❌ خطا در دریافت:', err.message);
                setMusicList([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userName, type]);


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

    // handlers
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
                    {/* Music List */}
                    <div className="flex flex-col gap-3">
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

                    {/* Bottom Player (mini) */}
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
                                    <button onClick={togglePlayPause} title={isPlaying ? 'مکث' : 'پخش'}>
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
                                <input type="range" value={progress} max={duration || 0} onChange={(e) => handleSeek(e.target.value)} className="w-full accent-[#FF9766]" />
                            </div>
                            <audio ref={audioRef} src={audioUrl || undefined} className="hidden" />
                        </div>
                    )}

                    {/* Fullscreen modal */}
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
