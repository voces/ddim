import {
  ImageMagick,
  IMagickImage,
  MagickFormat,
} from "https://deno.land/x/imagemagick_deno@0.0.14/mod.ts";
import {
  fetchUint8Array,
  handleEtag,
  isValidURL,
  parseBodyAndConvert,
  sha1,
} from "./shared.ts";
import { getUploaderHtml } from "./uploader.ts";

const convertToPng = (blob: Uint8Array) =>
  new Promise<Uint8Array>((resolve) =>
    ImageMagick.read(blob, (img: IMagickImage) =>
      img.write(
        (data: Uint8Array) => resolve(data),
        MagickFormat.Png,
      ))
  );

export const toPng = async (req: Request) => {
  const searchParams = new URL(req.url).searchParams;
  const path = searchParams.get("path");

  if (!path || !isValidURL(path)) {
    // Converting a POST'd body
    const name = searchParams.get("name");
    if (name) return parseBodyAndConvert(req, convertToPng, "png");

    // No path or name; return UI (html)
    return new Response(getUploaderHtml(), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // caching
  const [etag1, etagMatch] = await handleEtag(req, path);
  if (etagMatch) return etagMatch;

  // Fetching and converting a url
  const [png, etag2] = await Promise.all([
    convertToPng(await fetchUint8Array(path)),
    etag1 ?? sha1(path),
  ]);

  return new Response(png, {
    headers: {
      "Cache-Control": "public, max-age: 31536000, immutable",
      "Content-Type": "image/png",
      ETag: etag2,
    },
  });
};
