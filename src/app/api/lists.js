// مثال از فایل پراکسی
export default async function handler(req, res) {
    const { father } = req.query;  // دریافت father از URL
    console.log(father);
    if (!father) {
        return res.status(400).json({ error: 'father is required' });
    }

    const apiUrl = `https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=search_playlist&pageno=1&father=${father}&what_list=play_list`;

    try {
        const response = await fetch(apiUrl, { method: 'POST' });
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch data' });
        }

        const data = await response.json();
        res.status(200).json(data);  // ارسال داده‌ها به کلاینت
    } catch (error) {
        console.error('Error fetching data from external API:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
}
    