// src/app/api/ganre/route.js
export async function GET() {
    try {
        const res = await fetch(
            'https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=list_genre'
        );

        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'Failed to fetch data from rubibox' }), {
                status: res.status,
            });
        }

        const json = await res.json();

        return new Response(JSON.stringify({
            all: json.list,  // بازگشت لیست ژانرها
        }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
