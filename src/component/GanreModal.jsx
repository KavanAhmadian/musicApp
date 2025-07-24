// components/GenreModal.js
import { Icon } from "@iconify/react";
import Link from "next/link";

const GenreModal = ({ closeModal, genres, loading }) => {

    return (


        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

            <div className="bg-[#212121] rounded-lg w-[80%] max-w-lg p-4">
                {/* Close button */}
                <button onClick={closeModal} className="absolute top-2 right-2 text-white">
                    <Icon icon="solar:close-circle-outline" className="w-8 h-8" />
                </button>

                <h2 className="text-xl text-white">لیست ژانرها</h2>

                {/* Loading or Genres List */}
                {loading ? (
                    <p className="text-white mt-4">در حال بارگذاری...</p>
                ) : (
                    <div className="space-y-2 mt-4 text-white gap-1 flex items-center justify-between flex-wrap overflow-y-auto max-h-[400px] custom-scrollbar">
                        {genres.map((genre) => (
                            <Link href={`/ganre?ganre_id=${genre.id}`} key={genre.id} className="w-[45%] py-2 px-4 bg-[#333] rounded-md hover:bg-[#444]">
                                {genre.title}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Close Modal Button */}
                <div className="mt-4">
                    <button
                        onClick={closeModal}
                        className="w-full py-2 bg-[#FF9766] hover:bg-[#FF6855] rounded-md text-white"
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenreModal;
