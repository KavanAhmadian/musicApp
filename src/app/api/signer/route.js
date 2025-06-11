export async function POST(request) {
    const body = await request.json();
    const { key, action, singer_id, what_list, pageno } = body;

    const response = await fetch(
        `https://rubibox.ir/app-plus/api-test-web.php?key=${key}&action=${action}&singer_id=${singer_id}&what_list=${what_list}&pageno=${pageno}`
        // https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=list_music&pageno=1&singer_id=5&what_list=last_music

    );
    const data = await response.json();
    return Response.json(data);


    //api
}