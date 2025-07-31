// pages/api/liked-songs.js
export async function GET(req, res) {
    try {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
            return res.status(403).json({ msg: 'برای انجام این عمل باید وارد حساب شوید.' });
        }

        // فرض کنید داده‌های آهنگ‌های لایک شده را از دیتابیس می‌خوانید
        const likedSongs = [
            { id: 1, title: 'آهنگ 1', thumbnail_url: '/image/song1.jpg' },
            { id: 2, title: 'آهنگ 2', thumbnail_url: '/image/song2.jpg' },
        ];

        res.status(200).json({ songs: likedSongs });
    } catch (err) {
        res.status(500).json({ msg: 'خطا در سرور' });
    }
}

// pages/api/like-song.js
export async function POST(req, res) {
    try {
        const { songId } = req.body;
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
            return res.status(403).json({ msg: 'برای انجام این عمل باید وارد حساب شوید.' });
        }

   
        console.log(`کاربر ${storedUser} آهنگ ${songId} را لایک کرد.`);

        res.status(200).json({ msg: 'آهنگ با موفقیت لایک شد' });
    } catch (err) {
        res.status(500).json({ msg: 'خطا در لایک کردن آهنگ' });
    }
}
