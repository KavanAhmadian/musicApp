import React from 'react';
import Link from "next/link";
import Image from "next/image";

function Logo(props) {
    return (
        <Link href="/">
            <Image src="/image/logo.png" alt="بیت باکس" width={160} height={160}/>
        </Link>
    );
}

export default Logo;