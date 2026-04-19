export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);

    if (incomingUrl.pathname.startsWith("/api/")) {
      const pathSuffix = incomingUrl.pathname.replace(/^\/api\/?/, "");
      const targetUrl = new URL(`https://peanutswasteland.com/api/${pathSuffix}`);
      targetUrl.search = incomingUrl.search;

      const requestHeaders = new Headers();
      const accept = request.headers.get("accept");
      const acceptLanguage = request.headers.get("accept-language");
      const contentType = request.headers.get("content-type");

      if (accept) {
        requestHeaders.set("accept", accept);
      }
      if (acceptLanguage) {
        requestHeaders.set("accept-language", acceptLanguage);
      }
      if (contentType && request.method !== "GET" && request.method !== "HEAD") {
        requestHeaders.set("content-type", contentType);
      }

      requestHeaders.set("origin", "https://peanutswasteland.com");
      requestHeaders.set("referer", "https://peanutswasteland.com/");

      const init = {
        method: request.method,
        headers: requestHeaders,
        redirect: "follow"
      };

      if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = request.body;
      }

      const upstream = await fetch(targetUrl.toString(), init);
      const headers = new Headers(upstream.headers);
      headers.set("cache-control", "public, max-age=30");
      headers.set("access-control-allow-origin", "*");

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};
