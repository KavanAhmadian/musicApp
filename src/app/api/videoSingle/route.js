import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const video_id = searchParams.get('video_id');
    const list = 'last_music';
    console.log('video_id', video_id);
    if (!video_id || !list) {
        return NextResponse.json(
            { error: "Missing video_id or list parameter" },
            { status: 400 }
        );
    }

    const externalUrl = `https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=link_play&btn=Now&video_id=${video_id}&list=${list}`;
    console.log(externalUrl);
    try {
        const res = await fetch(externalUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.statusText}`);
        }

        const text = await res.text();

        if (text.startsWith("<!DOCTYPE html>")) {
            return NextResponse.json({
                error: "Received HTML instead of JSON. Possible server issue.",
                raw: text.slice(0, 300),
            }, { status: 500 });
        }

        const json = JSON.parse(text);
        return NextResponse.json(json, { status: 200 });

    } catch (err) {
        console.error("❌ Proxy error:", err);
        // اضافه کردن جزئیات خطای fetch
        return NextResponse.json(
            { error: "Failed to fetch from Rubibox", details: err.message },
            { status: 500 }
        );
    }
}
