import Client from "../Client.js";

export type CapturedFile = {
  name: string;
  type: string;
  size: number;
};

export type CapturedRequest = {
  url: string;
  method: string;
  body?: unknown;
};

export function createRequestCapture(responseBody = "{}") {
  const requests: CapturedRequest[] = [];

  const fetch: typeof globalThis.fetch = async (input) => {
    const request = input instanceof Request ? input : new Request(input);
    const contentType = request.headers.get("content-type") ?? "";
    let body: unknown;

    if (contentType.includes("application/json")) {
      const text = await request.clone().text();
      if (text) body = JSON.parse(text) as unknown;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.clone().formData();
      body = Object.fromEntries(
        Array.from(formData.entries(), ([key, value]) => [
          key,
          typeof value === "string"
            ? value
            : {
                name: value.name,
                type: value.type,
                size: value.size,
              },
        ]),
      );
    } else {
      const text = await request.clone().text();
      if (text) body = text;
    }

    requests.push({
      url: request.url,
      method: request.method,
      ...(body === undefined ? {} : { body }),
    });

    return new Response(responseBody, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  return { requests, fetch };
}

export function createClient() {
  const capture = createRequestCapture();
  const client = new Client({
    baseUrl: "https://graph.example.test/",
    request: { fetch: capture.fetch },
  });

  return { client, requests: capture.requests };
}
