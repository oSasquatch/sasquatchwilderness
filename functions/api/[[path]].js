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

  const requestHeaders = new Headers();
  const incomingAccept = context.request.headers.get("accept");
  const incomingAcceptLanguage = context.request.headers.get("accept-language");
  const incomingContentType = context.request.headers.get("content-type");

  if (incomingAccept) {
    requestHeaders.set("accept", incomingAccept);
  }
  if (incomingAcceptLanguage) {
    requestHeaders.set("accept-language", incomingAcceptLanguage);
  }
  if (incomingContentType && context.request.method !== "GET" && context.request.method !== "HEAD") {
    requestHeaders.set("content-type", incomingContentType);
  }
  requestHeaders.set("origin", "https://peanutswasteland.com");
  requestHeaders.set("referer", "https://peanutswasteland.com/");
  requestHeaders.set("user-agent", "SasquatchWildernessProxy/1.0");

  const init = {
    method: context.request.method,
    headers: requestHeaders,
    redirect: "follow"
  };

  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
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
