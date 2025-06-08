export async function POST(req) {
    try {
        const body = await req.json();
        const { what_list, key, pageno, action } = body;

        const res = await fetch(`https://rubibox.ir/app-plus/api-test-web.php?key=${key}&pageno=${pageno}&what_list=${what_list}&action=${action}`);

        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
