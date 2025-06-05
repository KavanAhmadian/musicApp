// برای App Router در Next.js 13+ داخل app/api/music/route.js
export async function POST(req) {
    try {
        const body = await req.json();

        const res = await fetch('https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=list_music&pageno=1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                what_list: body.what_list, // مثل last_music یا list_hot
            }),
        });

        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
