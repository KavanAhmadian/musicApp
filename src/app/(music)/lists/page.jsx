'use client'
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import Loader from "@/component/Loader";
import Link from "next/link";

export default function ListPage ()  {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const searchParams = useSearchParams()
    const father = searchParams.get('father')

    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await fetch('/api/lists', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        key: 'sdifu4530dsf98sf0sdf',
                        action: 'search_playlist',
                        father: father,
                        what_list: 'play_list',
                        pageno: '1',
                    }),
                });
                const data = await response.json();
                setPlaylists(data.list);
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


    if (loading) return <Loader />;
    if (error) return (
        <div className="text-center text-red-500 py-10">
            <p>خطا در دریافت اطلاعات</p>
            <button onClick={() => window.location.reload()} className="text-blue-500 mt-2">تلاش مجدد</button>
        </div>
    );
    return (
        <div className={`mb-[60px]`}>
            {playlists.length > 0 ? (
                playlists.map((playlist, index) => (
                    <Link href={`/lists`} key={index} className={`p-2 flex items-center justify-between mb-2 hover:bg-neutral-900`}>
                        <div className="flex items-center gap-4 ">
                            <img
                                src={playlist.thumbnail_url}
                                alt={playlist.title}
                                width={100}
                                height={100}
                                className={`w-[80px] h-[80px] object-cover rounded-2xl`} />

                            <h3 className={`text-white flex items-center justify-center w-full h-full text-sm `}>{playlist.title}</h3>
                        </div>
                        <p>{playlist.count}</p>
                    </Link>
                ))
            ) : (
                <div>No playlists found</div>
            )}
        </div>
    );
};


