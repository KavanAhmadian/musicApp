'use client'
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Loader from "@/component/Loader";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineFileDownload } from "react-icons/md";
import { RiPlayLargeLine } from "react-icons/ri";

function Page(props) {
    // ==== State ====
    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [duration, setDuration] = useState(0);
    const [type, setType] = useState("last_music");
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    const searchParams = useSearchParams();
    const listId = searchParams.get('list_id');
    const [listImage, setListImage] = useState('');
    const [sortType, setSortType] = useState('new_of_list'); // Default sort type

    // Fullscreen player modal states
    const [showFullPlayer, setShowFullPlayer] = useState(false);
    const [showLyricsFS, setShowLyricsFS] = useState(false);

    // ==== Fetch list data ====
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/listsongs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'sdifu4530dsf98sf0sdf',
                        action: 'list_music',
                        listId: listId,
                        what_list: 'play_list',
                        pageno: '1',
                        sort: sortType,
                    }),
                });
                const data = await response.json();
                setMusicList(data.all || []);
                setListImage(data.cover || '/image/default.jpg');
                setError(false);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (listId) fetchData();
    }, [listId, sortType]);

    // ==== Fetch playable URL when currentTrack changes ====
    useEffect(() => {
        if (!currentTrack) return;

        const fetchAudioUrl = async () => {
            try {
                const res = await fetch(`/api/play?video_id=${currentTrack.id}&list=${type}`);
                const contentType = res.headers.get("content-type");

                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.url) {
                        setAudioUrl(data.url);
                    } else {
                        console.warn("⚠️ لینک یافت نشد در JSON.");
                        setAudioUrl(null);
                    }
                } else {
                    const text = await res.text();
                    console.warn("⚠️ پاسخ JSON نبود. پاسخ سرور:\n", text.slice(0, 300));
                    throw new Error("پاسخ معتبر JSON نبود.");
                }
            } catch (err) {
                console.error("⛔ خطا در دریافت لینک پخش:", err.message);
                setAudioUrl(null);
            }
        };

        fetchAudioUrl();
    }, [currentTrack, type]);

    // ==== Audio element events (playback/progress) ====
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleCanPlay = () => {
            audio.play().then(() => setIsPlaying(true)).catch((err) => {
                console.warn('⛔ پخش ناموفق:', err?.message);
                setIsPlaying(false);
            });
        };
        const handleLoadedMeta = () => setDuration(audio.duration || 0);
        const updateProgress = () => setProgress(audio.currentTime || 0);

        audio.addEventListener('loadedmetadata', handleLoadedMeta);
        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('timeupdate', updateProgress);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMeta);
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('timeupdate', updateProgress);
        };
    }, [audioUrl]);

    // ==== Handlers ====
    const handleTrackClick = (music) => {
        setCurrentTrack(music);
        setIsPlaying(true);
    };

    const handleNextTrack = () => {
        if (!currentTrack) return;
        const currentIndex = musicList.findIndex(m => m.id === currentTrack.id);
        const next = musicList[currentIndex + 1];
        if (next) setCurrentTrack(next);
    };

    const handlePrevTrack = () => {
        if (!currentTrack) return;
        const currentIndex = musicList.findIndex(m => m.id === currentTrack.id);
        const prev = musicList[currentIndex - 1];
        if (prev) setCurrentTrack(prev);
    };

    const handlePlayAll = () => {
        if (musicList.length) {
            setCurrentTrack(musicList[0]);
            setIsPlaying(true);
        }
    };

    const handleSortChange = (sortValue) => setSortType(sortValue);

    const togglePlay = (e) => {
        // prevent bubbling to open full screen if used inside mini-player
        if (e) e.stopPropagation();
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
        if (!audioRef.current) return;
        audioRef.current.currentTime = Number(e.target.value);
        setProgress(Number(e.target.value));
    };

    const openFullScreen = () => setShowFullPlayer(true);
    const closeFullScreen = () => {
        setShowFullPlayer(false);
        setShowLyricsFS(false);
    };

    const playInFullscreen = (music) => {
        setCurrentTrack(music);     // ترک انتخاب شود
        setIsPlaying(true);         // قصد پخش را اعلام کن (canplaythrough خودش play را می‌زند)
        setShowFullPlayer(true);    // مدال فول‌اسکرین باز شود
    };

    const handleDownload = () => {
        if (!audioUrl) return;
        const link = document.createElement("a");
        link.href = audioUrl;
        link.setAttribute("download", `${currentTrack?.title || "music"}.mp3`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };


    return (
        <div>
            {/* Cover of list */}
            {listImage && (
                <div className="mb-6">
                    <Image
                        src={listImage}
                        alt="List Image"
                        width={300}
                        height={300}
                        className="object-cover rounded-xl w-full h-[300px] mb-6"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between mb-6">
                <button
                    onClick={handlePlayAll}
                    className="px-4 py-2 border text-white rounded-lg flex items-center justify-center gap-1.5"
                >
                    <Icon icon="solar:play-line-duotone" className="w-4 h-4 text-white cursor-pointer" />
                    پخش همه آهنگ‌ها
                </button>
                <button
                    className="px-4 py-2 border text-white rounded-lg flex items-center justify-center gap-1.5"
                >
                    <Icon icon="solar:list-check-outline" className="w-5 h-5 text-white cursor-pointer" />
                    افزودن به پلی لیست
                </button>
            </div>

            {/* Sorting */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    ترتیب نمایش براساس:
                    <select
                        onChange={(e) => handleSortChange(e.target.value)}
                        value={sortType}
                        className="px-2 py-1 bg-[#2E2E2E] text-white rounded mx-2 w-[150px] text-[14px]"
                    >
                        <option value="new_of_list">جدیدترین</option>
                        <option value="old_of_list">قدیمی ترین</option>
                        <option value="like_of_list">محبوب ترین</option>
                        <option value="view_of_list">پربازدید ترین</option>
                    </select>
                </div>
                <div>{musicList.length} آهنگ</div>
            </div>

            {/* List */}
            <div className="flex items-center justify-center flex-col gap-3 mb-16">
                {loading ? (
                    <Loader />
                ) : error ? (
                    <div className="text-red-400">خطا در دریافت لیست</div>
                ) : (
                    musicList.map((music, index) => (
                        <div
                            key={music.id || index}
                            className={`flex items-center justify-between rounded-2xl
                ${index % 2 === 0 ? 'bg-gradient-to-r from-[#2E2E2E] to-[#151515]' : 'bg-gradient-to-r from-[#151515] to-[#2E2E2E]'} 
                py-1 w-full cursor-pointer hover:bg-[#2a2a2a] transition`}
                            onClick={() => handleTrackClick(music)}
                        >
                            <div className="flex items-center gap-2">
                                <Image
                                    src={music.thumbnail_url || '/image/default.jpg'}
                                    className="rounded-xl object-cover cursor-pointer"
                                    alt={music.title || 'music'}
                                    height={80}
                                    width={80}
                                    sizes="80px"
                                    style={{ height: '80px', width: '80px' }}
                                />
                                <div className="flex flex-col">
                                    <h3 className="text-[17px] text-white cursor-pointer">{music.title || 'بدون عنوان'}</h3>
                                    <h6 className="text-[12px] text-[#6e6e6e]">{music.fard_name || 'نامشخص'}</h6>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mx-4">
                                <MdOutlineFileDownload className="text-white text-2xl cursor-pointer" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playInFullscreen(music); // ← ترک را ست کن + فول‌اسکرین + پخش
                                    }}
                                >
                                    <RiPlayLargeLine className="text-white text-2xl cursor-pointer" />
                                </button>


                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Mini Player */}
            {currentTrack && audioUrl && (
                <div
                    className="fixed bottom-[78px] z-[9910] duration-150 transition-all lg:bottom-0 left-0 right-0 bg-[#1a1a1a] text-white px-4 py-2 flex flex-col items-center shadow-lg border-t border-gray-800"
                    onClick={openFullScreen}
                >
                    <div className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Image
                                src={currentTrack.thumbnail_url || '/image/default.jpg'}
                                width={50}
                                height={50}
                                alt={currentTrack.title}
                                className="rounded"
                            />
                            <div>
                                <h4 className="text-white text-sm font-semibold mb-2">{currentTrack.title}</h4>
                                <p className="text-xs text-gray-400">{currentTrack.fard_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Expand Fullscreen explicit button (prevents accidental open from control clicks) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); openFullScreen(); }}
                                className="rounded-full p-2 hover:bg-white/10"
                                title="تمام‌صفحه"
                            >
                                <Icon icon="solar:maximize-square-linear" className="text-[#7F7F7F]" style={{ width: 24, height: 24 }} />
                            </button>

                            <button onClick={(e) => { e.stopPropagation(); handlePrevTrack(); }}>
                                <Icon
                                    icon="solar:skip-previous-outline"
                                    className="transition-colors duration-300 text-[#7F7F7F]"
                                    style={{ width: 28, height: 28 }}
                                />
                            </button>

                            <button onClick={(e) => togglePlay(e)}>
                                <div className="p-3 bg-[#FF9766] hover:bg-[#FF6855] rounded-full transition-all">
                                    <Icon
                                        icon={isPlaying ? "solar:pause-outline" : "solar:play-linear"}
                                        className="text-white"
                                        style={{ fontSize: 20 }}
                                    />
                                </div>
                            </button>

                            <button onClick={(e) => { e.stopPropagation(); handleNextTrack(); }}>
                                <Icon
                                    icon="solar:skip-next-outline"
                                    className="transition-colors duration-300 text-[#7F7F7F]"
                                    style={{ width: 28, height: 28 }}
                                />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!audioRef.current) return;
                                    audioRef.current.pause();
                                    audioRef.current.currentTime = 0;
                                    setCurrentTrack(null);
                                    setAudioUrl(null);
                                    setIsPlaying(false);
                                }}
                            >
                                <Icon icon="solar:close-circle-outline" className="text-[#7F7F7F]" style={{ width: 28, height: 28 }} />
                            </button>
                        </div>
                    </div>

                    <div className="w-full mt-2" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="range"
                            value={progress}
                            max={duration || 0}
                            onChange={handleSeek}
                            className="w-full accent-[#FF9766]"
                        />
                    </div>

                    <audio
                        ref={audioRef}
                        src={audioUrl || undefined}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                    />
                </div>
            )}

            {/* ===========================
          Fullscreen Player Modal
          =========================== */}
            {showFullPlayer && currentTrack && audioUrl && (
                <div className="fixed inset-0 z-[9999] bg-[#121212] text-white flex flex-col">
                    {/* Header */}
                    <div className="w-full flex items-center justify-between px-4 py-3 mb-2 bg-[#212121]">
                        <button onClick={closeFullScreen} className="text-[#FFEB3B]">بستن</button>

                        <button
                            className="flex items-center gap-1"
                            onClick={() => setShowLyricsFS(true)}
                        >
                            <Icon icon="solar:document-text-linear" className="text-2xl text-[#FFEB3B]" />
                            <span className="text-sm">متن آهنگ</span>
                        </button>
                    </div>

                    {/* Main */}
                    <div className="flex flex-col items-center justify-start px-4 py-2 flex-1 w-full max-w-md mx-auto">
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
                            <button className="flex items-center gap-1">
                                <Icon icon="solar:heart-linear" className="text-2xl text-[#FFEB3B]" />
                                <span className="text-sm">پسند</span>
                            </button>
                            <button className="flex items-center gap-1">
                                <Icon icon="solar:playlist-add-linear" className="text-2xl text-[#FFEB3B]" />
                                <span className="text-sm">افزودن به پلی‌لیست</span>
                            </button>
                            <button className="flex items-center gap-1">
                                <Icon icon="solar:share-linear" className="text-2xl text-[#FFEB3B]" />
                                <span className="text-sm">اشتراک</span>
                            </button>
                            <a
                                href={audioUrl || "#"}
                                download={`${currentTrack?.title || "music"}.mp3`}
                                className="flex items-center gap-1"
                            >
                                <Icon icon="solar:download-minimalistic-bold" className="text-2xl text-[#FFEB3B]" />
                                <span className="text-sm">دانلود</span>
                            </a>


                        </div>

                        <input
                            type="range"
                            value={progress}
                            max={duration || 0}
                            onChange={handleSeek}
                            className="w-full accent-[#FFEB3B] mb-4"
                        />

                        <div className="flex items-center gap-6">
                            <button onClick={handleNextTrack}>
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

                            <button onClick={handlePrevTrack}>
                                <Icon icon="solar:skip-previous-outline" className="text-[#FFEB3B] text-3xl" />
                            </button>
                        </div>
                    </div>

                    {/* Lyrics Modal in Fullscreen */}
                    {showLyricsFS && (
                        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-[#212121] rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6 relative shadow-xl">
                                <button
                                    onClick={() => setShowLyricsFS(false)}
                                    className="absolute top-3 left-3 text-[#FFEB3B] text-xl"
                                >
                                    <Icon icon="solar:close-circle-outline" />
                                </button>
                                <h3 className="text-xl font-bold mb-4 text-[#FFEB3B] text-center">متن آهنگ</h3>
                                <pre className="whitespace-pre-wrap text-gray-300 text-sm">
                  {(currentTrack?.des && String(currentTrack.des).trim()) || "متنی موجود نیست."}
                </pre>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Page;
