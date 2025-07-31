// pages/api/verify.js
export async function GET(req) {
    try {
        const url = new URL(req.url);
        const { user_name, encode } = Object.fromEntries(url.searchParams);

        // ارسال درخواست به سرور مقصد برای فعالسازی حساب
        const response = await fetch(
            `https://rubibox.ir/app-plus/api-test-users.php?key=sdifu4530dsf98sf0sdf&action=enable&user_name=${user_name}&encode=${encode}`,
            {
                method: 'GET', // متد GET برای ارسال کد تایید
            }
        );

        const data = await response.json();
        return new Response(JSON.stringify(data[0]), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ msg: 'Server error' }), { status: 500 });
    }
}
