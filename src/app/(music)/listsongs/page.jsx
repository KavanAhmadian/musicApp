'use client'
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Loader from "@/component/Loader";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { MdOutlineFileDownload, MdOutlineRemoveRedEye } from "react-icons/md";
import Link from "next/link";
import { RiPlayReverseLargeLine } from "react-icons/ri";
import { LuMusic4 } from "react-icons/lu";
import { IoFlameOutline } from "react-icons/io5";

function Page(props) {
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/listsongs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        key: 'sdifu4530dsf98sf0sdf',
                        action: 'list_music',
                        listId: listId,
                        what_list: 'play_list',
                        pageno: '1',
                        sort: sortType,  // Send the sortType to the server
                    }),
                });
                const data = await response.json();
                setMusicList(data.all);
                setListImage(data.thumbnail_url3 || '/image/default.jpg');
                setLoading(false);
            } catch (error) {
                setError(true);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [listId, sortType]);  // Fetch data whenever listId or sortType changes

    useEffect(() => {
        if (currentTrack) {
            const fetchAudioUrl = async () => {
                try {
                    const res = await fetch(`/api/play?video_id=${currentTrack.id}&list=${type}`);
                    const contentType = res.headers.get("content-type");

                    if (!res.ok) {
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }

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
        }
    }, [currentTrack, type]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleCanPlay = () => {
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch((err) => {
                console.warn('⛔ پخش ناموفق:', err.message);
                setIsPlaying(false);
            });
        };

        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });

        const updateProgress = () => {
            setProgress(audio.currentTime);
        };

        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('timeupdate', updateProgress);

        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('timeupdate', updateProgress);
        };
    }, [audioUrl]);

    const handleTrackClick = (music) => {
        setCurrentTrack(music);
        setIsPlaying(true);
    };

    const handleNextTrack = () => {
        const currentIndex = musicList.findIndex(m => m.id === currentTrack.id);
        const next = musicList[currentIndex + 1];
        if (next) {
            setCurrentTrack(next);
        }
    };

    const handlePrevTrack = () => {
        const currentIndex = musicList.findIndex(m => m.id === currentTrack.id);
        const prev = musicList[currentIndex - 1];
        if (prev) {
            setCurrentTrack(prev);
        }
    };

    const handlePlayAll = () => {
        setCurrentTrack(musicList[0]); // Set the first track
        setIsPlaying(true); // Start playing
    };

    const handleSortChange = (sortValue) => {
        setSortType(sortValue); // Update the sort type
    };

    return (
        <div>
            {/* Display large image of the list */}
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

            {/* Play All button */}
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

            {/* Sorting Controls */}
            <div className="flex justify-between items-center mb-6">
                <div>ترتیب نمایش براساس:
                    <select onChange={(e) => handleSortChange(e.target.value)} value={sortType} className="px-2 py-1 bg-[#2E2E2E] text-white rounded mx-2 w-[150px] text-[14px]">
                        <option value="new_of_list">جدیدترین</option>
                        <option value="old_of_list">قدیمی ترین</option>
                        <option value="like_of_list">محبوب ترین</option>
                        <option value="view_of_list">پربازدید ترین</option>
                    </select>
                </div>
                <div>{musicList.length} آهنگ</div>
            </div>

            {/* Song List */}
            <div className="flex items-center justify-center flex-col gap-3 mb-16">
                {loading ? (
                    <Loader />
                ) : (
                    musicList.map((music, index) => (
                        <div
                            key={index}
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
                                <Link href={`/singlemusic?video_id=${music.id}`}>
                                    <RiPlayReverseLargeLine className="text-white text-2xl cursor-pointer" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Audio Player Controls */}
            {currentTrack && audioUrl && (
                <div className="fixed bottom-[78px] z-[9910] duration-150 transition-all lg:bottom-0 left-0 right-0 bg-[#1a1a1a] text-white px-4 py-2 flex flex-col items-center shadow-lg border-t border-gray-800">
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

                        <div className="flex items-center gap-4">
                            <button onClick={handleNextTrack}>
                                <Icon
                                    icon="solar:skip-next-outline"
                                    className="transition-colors duration-300 text-[#7F7F7F]"
                                    style={{ width: "32px", height: "32px" }}
                                />
                            </button>
                            <button onClick={() => {
                                if (audioRef.current.paused) {
                                    audioRef.current.play();
                                    setIsPlaying(true);
                                } else {
                                    audioRef.current.pause();
                                    setIsPlaying(false);
                                }
                            }}>
                                <div className="p-4 bg-[#FF9766] hover:bg-[#FF6855] rounded-full transition-all">
                                    <Icon
                                        icon={isPlaying ? "solar:pause-outline" : "solar:play-linear"}
                                        className="text-white"
                                        style={{ fontSize: 24 }}
                                    />
                                </div>
                            </button>
                            <button onClick={handlePrevTrack}>
                                <Icon
                                    icon="solar:skip-previous-outline"
                                    className="transition-colors duration-300 text-[#7F7F7F]"
                                    style={{ width: "32px", height: "32px" }}
                                />
                            </button>
                            <button onClick={() => {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                                setCurrentTrack(null);
                                setAudioUrl(null);
                                setIsPlaying(false);
                            }}>
                                <Icon icon="solar:close-circle-outline" className="text-[#7F7F7F]" style={{width: "32px", height: "32px"}}/>
                            </button>
                        </div>
                    </div>
                    <div className="w-full mt-2">
                        <input
                            type="range"
                            value={progress}
                            max={duration || 0}
                            onChange={(e) => {
                                audioRef.current.currentTime = e.target.value;
                            }}
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
        </div>
    );
}

export default Page;
