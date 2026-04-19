export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url);
  const pathSuffix = incomingUrl.pathname.replace(/^\/api\/?/, "");
  const targetUrl = new URL(`https://peanutswasteland.com/api/${pathSuffix}`);
  targetUrl.search = incomingUrl.search;

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
        "access-control-allow-headers": "content-type,authorization"
      }
    });
  }

  const init = {
    method: context.request.method,
    headers: new Headers({
      accept: context.request.headers.get("accept") || "application/json, text/plain, */*",
      "accept-language": context.request.headers.get("accept-language") || "en-US,en;q=0.9",
      origin: "https://peanutswasteland.com",
      referer: "https://peanutswasteland.com/"
    }),
    redirect: "follow"
  };

  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    const incomingContentType = context.request.headers.get("content-type");
    if (incomingContentType) {
      init.headers.set("content-type", incomingContentType);
    }
    init.body = context.request.body;
  }

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("cache-control", "public, max-age=30");
  responseHeaders.set("access-control-allow-origin", "*");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  });
}
