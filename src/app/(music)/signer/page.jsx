'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { MdOutlineFileDownload } from 'react-icons/md';
import Link from 'next/link';

export default function SignerPage() {
    // ====== States (ترتیب ثابت نگه داشته شود) ======
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [albumSongs, setAlbumSongs] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const [loading, setLoading] = useState(true);
    const [albumsLoading, setAlbumsLoading] = useState(false);
    const [albumSongsLoading, setAlbumSongsLoading] = useState(false);

    const [error, setError] = useState(null);

    const [view, setView] = useState('songs'); // 'songs' | 'albums'
    const [type, setType] = useState('last_music'); // برای /api/play
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);
    const [duration, setDuration] = useState(0);

    const [showFullPlayer, setShowFullPlayer] = useState(false);
    const [showLyricsFS, setShowLyricsFS] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const signerId = searchParams.get('id');

    // ====== Fetch: لیست آهنگ‌های اخیر خواننده ======
    useEffect(() => {
        const fetchSongs = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/signer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'sdifu4530dsf98sf0sdf',
                        action: 'list_music',
                        singer_id: signerId,
                        what_list: 'last_music',
                        pageno: '1'
                    })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setSongs(data.all || []);
            } catch (e) {
                setError('خطا در دریافت آهنگ‌ها');
            } finally {
                setLoading(false);
            }
        };
        if (signerId) fetchSongs();
    }, [signerId]);

    // ====== Fetch: لیست آلبوم‌های خواننده ======
    const fetchAlbums = async () => {
        setAlbumsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/album?father=${encodeURIComponent(signerId)}`, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAlbums(data.all || []); // 'all' رو از سرور برمی‌گردونیم
        } catch (e) {
            setError('خطا در دریافت آلبوم‌ها');
        } finally {
            setAlbumsLoading(false);
        }
    };

    // ====== Fetch: آهنگ‌های یک آلبوم ======
    const fetchAlbumSongs = async (album) => {
        setAlbumSongsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/signer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'sdifu4530dsf98sf0sdf',
                    action: 'list_music',
                    playlist_id: album.id, // اگر پارامتر متفاوت است، با بک‌اند هماهنگ کن
                    what_list: 'album_music',
                    pageno: '1'
                })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAlbumSongs(data.all || []);
        } catch (e) {
            setError('خطا در دریافت آهنگ‌های آلبوم');
        } finally {
            setAlbumSongsLoading(false);
        }
    };

    // ====== گرفتن لینک پخش برای ترک انتخابی ======
    useEffect(() => {
        const run = async () => {
            if (!currentTrack) return;
            try {
                const res = await fetch(`/api/play?video_id=${currentTrack.id}&list=${type}`);
                const ctype = res.headers.get('content-type');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                if (ctype && ctype.includes('application/json')) {
                    const data = await res.json();
                    setAudioUrl(data.url || null);
                } else {
                    const text = await res.text();
                    console.warn('پاسخ JSON نبود:\n', text.slice(0, 300));
                    throw new Error('پاسخ معتبر JSON نبود');
                }
            } catch (e) {
                console.error('خطا در دریافت لینک پخش:', e.message);
                setAudioUrl(null);
            }
        };
        run();
    }, [currentTrack, type]);

    // ====== کنترل‌های پلیر ======
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleCanPlay = () => {
            audio
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        };
        const onMeta = () => setDuration(audio.duration || 0);
        const onTime = () => setProgress(audio.currentTime || 0);

        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('loadedmetadata', onMeta);
        audio.addEventListener('timeupdate', onTime);

        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('timeupdate', onTime);
        };
    }, [audioUrl]);

    // ====== هندلرها ======
    const handleTrackClick = (track, source = 'songs') => {
        setType(source === 'albums' ? 'Album' : 'last_music');
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const playInFullscreen = (track, source = 'songs') => {
        setType(source === 'albums' ? 'Album' : 'last_music');
        setCurrentTrack(track);
        setIsPlaying(true);
        setShowFullPlayer(true);
    };

    const handleNextTrack = () => {
        const list = selectedAlbum ? albumSongs : songs;
        if (!currentTrack || !list?.length) return;
        const idx = list.findIndex((m) => m.id === currentTrack.id);
        const next = list[idx + 1];
        if (next) setCurrentTrack(next);
    };

    const handlePrevTrack = () => {
        const list = selectedAlbum ? albumSongs : songs;
        if (!currentTrack || !list?.length) return;
        const idx = list.findIndex((m) => m.id === currentTrack.id);
        const prev = list[idx - 1];
        if (prev) setCurrentTrack(prev);
    };

    const handleSeek = (e) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
            setProgress(Number(e.target.value));
        }
    };

    const handleDownloadCurrent = () => {
        if (!audioUrl) return;
        const link = document.createElement('a');
        link.href = audioUrl;
        link.setAttribute('download', `${currentTrack?.title || 'music'}.mp3`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleDownloadTrack = async (track, source = 'songs') => {
        try {
            // اگر ترک جاری است و لینک داریم، مستقیم دانلود
            if (currentTrack?.id === track.id && audioUrl) {
                handleDownloadCurrent();
                return;
            }
            // در غیر این صورت یک بار لینک را می‌گیریم و دانلود می‌کنیم (بدون عوض‌کردن currentTrack)
            const listParam = source === 'albums' ? 'Album' : 'last_music';
            const res = await fetch(`/api/play?video_id=${track.id}&list=${listParam}`);
            const ctype = res.headers.get('content-type');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            let url = null;
            if (ctype && ctype.includes('application/json')) {
                const data = await res.json();
                url = data.url || null;
            } else {
                const text = await res.text();
                console.warn('پاسخ JSON نبود:\n', text.slice(0, 300));
                throw new Error('پاسخ معتبر JSON نبود');
            }
            if (!url) return;
            const a = document.createElement('a');
            a.href = url;
            a.setAttribute('download', `${track?.title || 'music'}.mp3`);
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            console.error('دانلود ناموفق:', e.message);
        }
    };

    const closeFullScreen = () => {
        setShowFullPlayer(false);
        setShowLyricsFS(false);
    };

    // ====== UI ======
    return (
        <div className="mb-16">
            {/* Tabs */}
            <div className="w-full flex items-center justify-around bg-neutral-800 rounded-xl mb-4 p-2">
                <button
                    onClick={() => {
                        setView('songs');
                        setSelectedAlbum(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 ${view === 'songs' ? 'text-white' : 'text-gray-300'}`}
                >
                    <Icon icon="solar:music-note-3-outline" className="w-6 h-6" />
                    آهنگ‌ها
                </button>

                <button
                    onClick={() => {
                        setView('albums');
                        setSelectedAlbum(null);
                        if (!albums.length) fetchAlbums();
                    }}
                    className={`flex items-center justify-center gap-1.5 ${view === 'albums' ? 'text-white' : 'text-gray-300'}`}
                >
                    <Icon icon="solar:music-library-linear" className="w-6 h-6" />
                    آلبوم‌ها
                </button>
            </div>

            {/* Errors */}
            {error && <div className="text-center text-red-500 py-4">{error}</div>}

            {/* Songs View */}
            {view === 'songs' && (
                <>
                    {loading ? (
                        <div className="text-center text-white py-10">در حال بارگذاری...</div>
                    ) : !songs.length ? (
                        <div className="text-center text-gray-400 py-10">آهنگی برای این خواننده یافت نشد</div>
                    ) : (
                        <div className="flex items-center justify-center flex-col gap-3">
                            {songs.map((music, index) => (
                                <div
                                    key={music.id ?? index}
                                    className={`flex items-center justify-between rounded-2xl ${
                                        index % 2 === 0 ? 'bg-gradient-to-r from-[#2E2E2E] to-[#151515]' : 'bg-gradient-to-r from-[#151515] to-[#2E2E2E]'
                                    } py-1 w-full hover:bg-[#2a2a2a] transition`}
                                >
                                    <button
                                        className="flex items-center gap-2 text-left flex-1"
                                        onClick={() => handleTrackClick(music, 'songs')}
                                    >
                                        <Image
                                            src={music.thumbnail_url || '/image/default.jpg'}
                                            className="rounded-xl object-cover"
                                            alt={music.title || 'music'}
                                            height={80}
                                            width={80}
                                        />
                                        <div className="flex flex-col">
                                            <h3 className="text-[20px] text-white">{music.title || 'بدون عنوان'}</h3>
                                            <h6 className="text-[14px] text-[#6e6e6e]">{music.fard_name || 'نامشخص'}</h6>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-3 mx-4">
                                        {/* دانلود مستقیم آن آیتم */}
                                        <button
                                            onClick={() => handleDownloadTrack(music, 'songs')}
                                            title="دانلود"
                                        >
                                            <MdOutlineFileDownload className="text-white text-2xl" />
                                        </button>

                                        {/* پخش در فول‌اسکرین */}
                                        <button
                                            onClick={() => playInFullscreen(music, 'songs')}
                                            title="پخش تمام‌صفحه"
                                        >
                                            <Icon icon="solar:play-linear" className="text-white" style={{ fontSize: 24 }} />
                                        </button>

                                        {/* در صورت نیاز لینک صفحه‌ی سینگل */}
                                        {/*<Link href={`/singlemusic?video_id=${music.id}`} title="صفحه‌ی آهنگ">*/}
                                        {/*    <Icon icon="solar:music-library-2-outline" className="text-white/70" style={{ fontSize: 22 }} />*/}
                                        {/*</Link>*/}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Albums View */}
            {view === 'albums' && (
                <div className="flex flex-col gap-5">
                    {/* لیست آلبوم‌ها */}
                    {albumsLoading ? (
                        <div className="text-center text-white py-10">در حال بارگذاری آلبوم‌ها...</div>
                    ) : !albums.length ? (
                        <div className="text-center text-gray-400 py-10">آلبومی برای این خواننده یافت نشد</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {albums.map((alb) => (
                                <button
                                    key={alb.id}
                                    onClick={() => {
                                        setSelectedAlbum(alb);
                                        fetchAlbumSongs(alb);
                                        setAlbumSongs([]);
                                    }}
                                    className="bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-2xl p-3 text-left transition"
                                >
                                    <div className="w-full aspect-square relative mb-2">
                                        <Image
                                            src={alb.thumbnail_url || '/image/default.jpg'}
                                            alt={alb.title || 'album'}
                                            fill
                                            className="rounded-xl object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white text-sm font-semibold">{alb.title || 'آلبوم بی‌نام'}</span>
                                        <span className="text-xs text-gray-400">{alb.fard_name || ''}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* آهنگ‌های آلبوم انتخاب‌شده */}
                    {selectedAlbum && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-white text-lg font-bold">
                                    آهنگ‌های آلبوم: <span className="text-orange-400">{selectedAlbum.title}</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        setSelectedAlbum(null);
                                        setAlbumSongs([]);
                                    }}
                                    className="text-sm text-gray-300 hover:text-white"
                                >
                                    برگشت به لیست آلبوم‌ها
                                </button>
                            </div>

                            {albumSongsLoading ? (
                                <div className="text-center text-white py-8">در حال بارگذاری آهنگ‌های آلبوم...</div>
                            ) : !albumSongs.length ? (
                                <div className="text-center text-gray-400 py-8">آهنگی برای این آلبوم یافت نشد</div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {albumSongs.map((track, index) => (
                                        <div
                                            key={track.id ?? index}
                                            className={`flex items-center justify-between rounded-2xl ${
                                                index % 2 === 0 ? 'bg-gradient-to-r from-[#2E2E2E] to-[#151515]' : 'bg-gradient-to-r from-[#151515] to-[#2E2E2E]'
                                            } py-1 w-full hover:bg-[#2a2a2a] transition`}
                                        >
                                            <button
                                                className="flex items-center gap-2 text-left flex-1"
                                                onClick={() => handleTrackClick(track, 'albums')}
                                            >
                                                <Image
                                                    src={track.thumbnail_url || '/image/default.jpg'}
                                                    className="rounded-xl object-cover"
                                                    alt={track.title || 'music'}
                                                    height={80}
                                                    width={80}
                                                />
                                                <div className="flex flex-col">
                                                    <h3 className="text-[20px] text-white">{track.title || 'بدون عنوان'}</h3>
                                                    <h6 className="text-[14px] text-[#6e6e6e]">{track.fard_name || selectedAlbum?.fard_name || 'نامشخص'}</h6>
                                                </div>
                                            </button>
                                            <div className="flex items-center gap-3 mx-4">
                                                <button
                                                    onClick={() => handleDownloadTrack(track, 'albums')}
                                                    title="دانلود"
                                                >
                                                    <MdOutlineFileDownload className="text-white text-2xl" />
                                                </button>

                                                <button
                                                    onClick={() => playInFullscreen(track, 'albums')}
                                                    title="پخش تمام‌صفحه"
                                                >
                                                    <Icon icon="solar:play-linear" className="text-white" style={{ fontSize: 24 }} />
                                                </button>

                                                <Link href={`/singlemusic?video_id=${track.id}`} title="صفحه‌ی آهنگ">
                                                    <Icon icon="solar:music-library-2-outline" className="text-white/70" style={{ fontSize: 22 }} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Mini Player */}
            {currentTrack && audioUrl && (
                <div className="fixed bottom-[78px] z-[9910] duration-150 transition-all lg:bottom-0 left-0 right-0 bg-[#1a1a1a] text-white px-4 py-2 flex flex-col items-center shadow-lg border-t border-gray-800">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Image
                                src={currentTrack.thumbnail_url || '/image/default.jpg'}
                                width={50}
                                height={50}
                                alt={currentTrack.title || 'track'}
                                className="rounded"
                            />
                            <div>
                                <h4 className="text-white text-sm font-semibold mb-1">{currentTrack.title}</h4>
                                <p className="text-xs text-gray-400">{currentTrack.fard_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* دانلود ترک جاری */}
                            {/*<button onClick={handleDownloadCurrent} title="دانلود">*/}
                            {/*    <MdOutlineFileDownload className="text-white text-2xl" />*/}
                            {/*</button>*/}

                            {/* باز کردن فول‌اسکرین */}
                            <button onClick={() => setShowFullPlayer(true)} className="rounded-full p-2 hover:bg-white/10" title="تمام‌صفحه">
                                <Icon icon="solar:maximize-square-linear" className="text-[#7F7F7F]" style={{ width: 24, height: 24 }} />
                            </button>

                            <button onClick={handlePrevTrack}>
                                <Icon icon="solar:skip-previous-outline" className="text-[#7F7F7F]" style={{ width: 28, height: 28 }} />
                            </button>

                            <button
                                onClick={() => {
                                    if (audioRef.current?.paused) {
                                        audioRef.current.play();
                                        setIsPlaying(true);
                                    } else {
                                        audioRef.current?.pause();
                                        setIsPlaying(false);
                                    }
                                }}
                            >
                                <div className="p-3 bg-[#FF9766] hover:bg-[#FF6855] rounded-full transition-all">
                                    <Icon icon={isPlaying ? 'solar:pause-outline' : 'solar:play-linear'} className="text-white" style={{ fontSize: 20 }} />
                                </div>
                            </button>

                            <button onClick={handleNextTrack}>
                                <Icon icon="solar:skip-next-outline" className="text-[#7F7F7F]" style={{ width: 28, height: 28 }} />
                            </button>

                            <button
                                onClick={() => {
                                    if (audioRef.current) {
                                        audioRef.current.pause();
                                        audioRef.current.currentTime = 0;
                                    }
                                    setCurrentTrack(null);
                                    setAudioUrl(null);
                                    setIsPlaying(false);
                                }}
                            >
                                <Icon icon="solar:close-circle-outline" className="text-[#7F7F7F]" style={{ width: 28, height: 28 }} />
                            </button>
                        </div>
                    </div>

                    <div className="w-full mt-2">
                        <input
                            type="range"
                            value={progress}
                            max={duration || 0}
                            onChange={handleSeek}
                            className="w-full accent-[#FF9766]"
                        />
                    </div>

                    <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlaying(false)} className="hidden" />
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

                        <div className="flex items-center gap-3">


                            {/* Lyrics */}
                            <button
                                className="flex items-center gap-1"
                                onClick={() => setShowLyricsFS(true)}
                            >
                                <Icon icon="solar:document-text-linear" className="text-2xl text-[#FFEB3B]" />
                                <span className="text-sm">متن آهنگ</span>
                            </button>
                        </div>
                    </div>

                    {/* Main */}
                    <div className="flex flex-col items-center justify-start px-4 py-2 flex-1 w-full max-w-md mx-auto">
                        <Image
                            src={currentTrack.thumbnail_url || '/image/default.jpg'}
                            alt={currentTrack.title || 'track'}
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
                            {/* Download in FS */}
                            <button onClick={handleDownloadCurrent} className="flex items-center cursor-pointer gap-1">
                                <Icon icon="solar:download-minimalistic-bold" className="text-2xl text-[#FFEB3B]" />
                                <span className="text-sm">دانلود</span>
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
                            <button onClick={handleNextTrack}>
                                <Icon icon="solar:skip-next-outline" className="text-[#FFEB3B] text-3xl" />
                            </button>

                            <button
                                onClick={() => {
                                    if (audioRef.current?.paused) {
                                        audioRef.current.play();
                                        setIsPlaying(true);
                                    } else {
                                        audioRef.current?.pause();
                                        setIsPlaying(false);
                                    }
                                }}
                                className="p-4 bg-[#FFEB3B] hover:bg-[#C7B40B] rounded-full transition-all"
                            >
                                <Icon
                                    icon={isPlaying ? 'solar:pause-outline' : 'solar:play-linear'}
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
                  {(currentTrack?.des && String(currentTrack.des).trim()) || 'متنی موجود نیست.'}
                </pre>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
