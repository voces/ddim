export const parseBodyAndConvert = async (
  req: Request,
  converter: (blob: Uint8Array) => Promise<Uint8Array>,
) => {
  const name = new URL(req.url).searchParams.get("name");
  if (!name) throw new Error("Expected name in searchParams");
  const data = await req.blob().then((b) => b.arrayBuffer()).then((b) =>
    new Uint8Array(b)
  );
  const result = await converter(data);
  return new Response(result, {
    headers: {
      "Content-Type": "image/png",
      "ddim-new-file-name": `${
        name.includes(".") ? name.split(".").slice(0, -1).join(".") : name
      }.png`,
    },
  });
};

export const sha1 = async (text: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest(
        "SHA-1",
        new TextEncoder().encode(text),
      ),
    ),
  ).map((b) => b.toString(16).padStart(2, "0")).join("");

export const fetchUint8Array = (url: string) =>
  fetch(url).then((r) => r.arrayBuffer()).then((b) => new Uint8Array(b));

export const isValidURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const handleEtag = async (
  req: Request,
  data: string,
): Promise<[etag: string | undefined, response: Response | undefined]> => {
  if (req.headers.has("if-none-match")) {
    const etag = await sha1(data);
    if (req.headers.get("if-none-match") === etag) {
      return [etag, new Response(undefined, { status: 304 })];
    }
    return [etag, undefined];
  }
  return [undefined, undefined];
};
