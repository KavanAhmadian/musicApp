import React from 'react';
import { FaArrowLeftLong } from "react-icons/fa6";
import Link from "next/link";

function SectionTitle(props) {
    return (
        <div className={`flex items-center justify-between p-2 py-3 rounded-full my-4 bg-linear-65 from-[#151515] to-[#2E2E2E]`}>
            <h2 className={`text-[#FFEB3B]`}>{props.title_list}</h2>
            <Link href={`/`}>
                <FaArrowLeftLong className={`text-[#FFEB3B]`} />
            </Link>
        </div>
    );
}

export default SectionTitle;