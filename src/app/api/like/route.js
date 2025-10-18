export async function POST(req) {
    try {
        const { user_name, id } = await req.json();

        const response = await fetch(
            "https://rubibox.ir/app-plus/api-test-faves.php?key=pewTri54tboYEiirt8topiesf15&action=new",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    user_name,
                    act: "Like",
                    id,
                }),
            }
        );

        const text = await response.text();
        console.log("🔍 Raw response:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: "Invalid JSON", raw: text };
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("API Proxy Error:", error);
        return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
        });
    }
}
