export async function POST(request) {
    const body = await request.json();
    const { key, action, father, what_list, pageno } = body;

    const response = await fetch(
        `https://rubibox.ir/app-plus/api-test-web.php?key=${key}&action=${action}&father=${father}&what_list=${what_list}&pageno=${pageno}`
    );
    const data = await response.json();
    return Response.json(data);


    //api
}