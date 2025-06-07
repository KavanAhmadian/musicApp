// app/api/play/route.js (یا play/route.ts)
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const video_id = searchParams.get('video_id');
    const list = searchParams.get('list');

    if (!video_id || !list) {
        return new Response(JSON.stringify({ error: "Missing video_id or list parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const externalUrl = `https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=link_play&btn=Now&video_id=${video_id}&list=${list}`;

    try {
        const res = await fetch(externalUrl);
        const contentType = res.headers.get("content-type");

        if (!res.ok) {
            return new Response(JSON.stringify({ error: "Remote API responded with error" }), {
                status: res.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (contentType.includes("application/json")) {
            const data = await res.json();
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } else {
            const text = await res.text();
            return new Response(JSON.stringify({ error: "Response was not JSON", raw: text.slice(0, 300) }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (err) {
        console.error("Proxy error:", err.message);
        return new Response(JSON.stringify({ error: "Failed to fetch audio link" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
