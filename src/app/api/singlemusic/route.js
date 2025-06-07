export async function POST(request) {
    const body = await request.json();
    const { key, action, videoId, what_list , btn } = body;

    const response = await fetch(
        `https://rubibox.ir/app-plus/api-test-web.php?key=${key}&action=${action}&video_id=${videoId}&what_list=${what_list}&btn=${btn}`

        //https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=link_play&btn=now&video_id=1211
    );
    const data = await response.json();
    return Response.json(data);


    //api
}