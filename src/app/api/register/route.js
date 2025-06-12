export async function POST(req) {
    try {
        const body = await req.json();
        const { name, user_name, pass, refed_by } = body;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('user_name', user_name);
        formData.append('pass', pass);
        formData.append('refed_by', refed_by || '');

        const response = await fetch(
            'https://rubibox.ir/app-plus/api-test-users.php?key=sdifu4530dsf98sf0sdf&action=new',
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();
        return new Response(JSON.stringify(data[0]), { status: 200 });
    } catch (err) {
        console.error("❌ Server error:", err);
        return new Response(JSON.stringify({ msg: 'Server error' }), { status: 500 });
    }
}
