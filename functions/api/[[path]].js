export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url);
  const pathSuffix = incomingUrl.pathname.replace(/^\/api\/?/, "");
  const targetUrl = new URL(`https://peanutswasteland.com/api/${pathSuffix}`);
  targetUrl.search = incomingUrl.search;

  const init = {
    method: context.request.method,
    headers: new Headers(context.request.headers),
    body: context.request.body,
    redirect: "follow"
  };

  init.headers.delete("host");
  init.headers.set("origin", "https://peanutswasteland.com");
  init.headers.set("referer", "https://peanutswasteland.com/");

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("cache-control", "public, max-age=30");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  });
}
