

export async function GET() {
    try {
        const res = await fetch(
            'https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=vitrin&pageno=1'
        );

        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'Failed to fetch from rubibox' }), {
                status: res.status,
            });
        }

        const data = await res.json();
        return Response.json(data); // ✅ به کلاینت برمی‌گردونیم
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
