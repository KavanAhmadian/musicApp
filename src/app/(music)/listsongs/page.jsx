'use client'
import React, {useEffect, useRef, useState} from 'react';
import {useSearchParams} from "next/navigation";
import Loader from "@/component/Loader";
import Image from "next/image";
import {MdOutlineFileDownload, MdOutlineRemoveRedEye} from "react-icons/md";
import Link from "next/link";
import {RiPlayReverseLargeLine} from "react-icons/ri";
import {LuMusic4} from "react-icons/lu";
import {IoFlameOutline} from "react-icons/io5";


function Page(props) {

    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [type, setType] = useState("last_music");
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    const searchParams = useSearchParams()
    const listId = searchParams.get('list_id')

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
                    }),
                });
                const data = await response.json();
                setMusicList(data.all);
                setLoading(false);
            } catch (error) {
                setError(true);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    return (
        <div>
            <div className="flex items-center justify-center flex-col gap-3">
                {loading ? (
                    <Loader/>
                ) : (
                    musicList.map((music, index) => (
                        <div key={index}
                             className="flex items-center justify-between bg-[#212121] py-1 w-full cursor-pointer hover:bg-[#2a2a2a] transition"
                             onClick={() => handleTrackClick(music)}>
                            <div className="flex items-center gap-2">
                                <Image src={music.thumbnail_url || '/image/default.jpg'}
                                       className="rounded-xl object-cover cursor-pointer"
                                       alt={music.title || 'music'}
                                       height={80} width={80}/>
                                <div className="flex flex-col">
                                    <h3 className="text-[20px] text-white cursor-pointer">{music.title || 'بدون عنوان'}</h3>
                                    <h6 className="text-[14px] text-[#6e6e6e]">{music.fard_name || 'نامشخص'}</h6>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mx-4">
                                <MdOutlineFileDownload className="text-white text-2xl cursor-pointer"/>
                                <Link href={`/singlemusic?video_id=${music.id}`}>
                                    <RiPlayReverseLargeLine className="text-white text-2xl cursor-pointer"/>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {currentTrack && audioUrl && (
                <div className="fixed bottom-[80px] left-0 right-0 bg-[#1a1a1a] text-white px-4 py-2 flex flex-col items-center z-50 shadow-lg border-t border-gray-800">
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
                            <button onClick={handlePrevTrack}>⏮️</button>
                            <button onClick={() => {
                                if (audioRef.current.paused) {
                                    audioRef.current.play();
                                    setIsPlaying(true);
                                } else {
                                    audioRef.current.pause();
                                    setIsPlaying(false);
                                }
                            }}>
                                {isPlaying ? '⏸️' : '▶️'}
                            </button>
                            <button onClick={handleNextTrack}>⏭️</button>
                            <button onClick={() => {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                                setCurrentTrack(null);
                                setAudioUrl(null);
                                setIsPlaying(false);
                            }}>❌</button>
                        </div>
                    </div>
                    <div className="w-full mt-2">
                        <input
                            type="range"
                            value={progress}
                            max={audioRef.current?.duration || 0}
                            onChange={(e) => {
                                audioRef.current.currentTime = e.target.value;
                            }}
                            className="w-full"
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