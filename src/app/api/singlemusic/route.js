import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const video_id = searchParams.get('video_id');
    const list = searchParams.get('list');
    const btn = searchParams.get('btn');



    if (!video_id || !list) {
        return NextResponse.json(
            { error: "Missing video_id or list parameter" },
            { status: 400 }
        );
    }

    const externalUrl = `https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=link_play&btn=${btn}&video_id=${video_id}&list=${list}`;

    try {
        const res = await fetch(externalUrl);
        const text = await res.text();

        try {
            const json = JSON.parse(text);
            return NextResponse.json(json, { status: 200 });
        } catch (parseError) {

            return NextResponse.json({
                error: "Response was not JSON",
                raw: text.slice(0, 300),
                statusCode: res.status
            }, { status: 500 });
        }

    } catch (err) {

        return NextResponse.json(
            { error: "Failed to fetch from Rubibox" },
            { status: 500 }
        );
    }
}
