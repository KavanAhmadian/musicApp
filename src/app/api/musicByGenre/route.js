// src/app/api/musicByGenre/route.js

export async function POST(request) {
    // دریافت داده‌ها از بدنه درخواست
    const { genre, what_list, pageno } = await request.json();

    try {
        // ارسال درخواست به API خارجی با پارامترهای دریافت شده از بدنه درخواست
        const res = await fetch(`https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=list_music&genre=${genre}&what_list=${what_list}&pageno=${pageno}`);

        if (!res.ok) {
            return new Response(
                JSON.stringify({ error: "Failed to fetch music data from Rubibox" }),
                { status: res.status }
            );
        }

        const json = await res.json();

        return new Response(
            JSON.stringify({
                all: json.all, // ارسال لیست موزیک‌ها
            }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
