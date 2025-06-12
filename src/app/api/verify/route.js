export async function POST(req) {
    try {
        const body = await req.json();
        const { user_name, encode } = body;

        const formData = new URLSearchParams();
        formData.append('user_name', user_name);
        formData.append('encode', encode);

        const response = await fetch(
            'https://rubibox.ir/app-plus/api-test-users.php?key=sdifu4530dsf98sf0sdf&action=enable',
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();
        return new Response(JSON.stringify(data[0]), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ msg: 'Server error' }), { status: 500 });
    }
}
