export async function GET() {
    try {
        const res = await fetch(
            'https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=play_list_vitrin'
        );

        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'Failed to fetch data from rubibox' }), {
                status: res.status,
            });
        }

        const json = await res.json();

        // چون JSON اصلی خودش all داره و همین ساختار مورد نیاز شماست
        return Response.json({
            all: json.all, // مهم: all رو مستقیم پاس بده
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
