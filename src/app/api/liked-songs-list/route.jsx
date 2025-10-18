export async function POST(req) {
    try {
        const body = await req.json();
        const { act, key, pageno, action, user_name } = body;

        const res = await fetch(
            `https://rubibox.ir/app-plus/api-test-faves.php?key=${key}&action=${action}&pageno=${pageno}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    user_name,
                    act,
                }),
            }
        );

        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
