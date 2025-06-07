export async function POST(request) {
    const body = await request.json();
    const { key, action, listId, what_list, pageno } = body;

    const response = await fetch(
        `https://rubibox.ir/app-plus/api-test-web.php?key=${key}&action=${action}&list_id=${listId}&what_list=${what_list}&pageno=${pageno}`
    // https://rubibox.ir/app-plus/api-test-web.php?key=sdifu4530dsf98sf0sdf&action=list_music&pageno=1&list_id=591&what_list=play_list

    );
    const data = await response.json();
    return Response.json(data);


    //api
}