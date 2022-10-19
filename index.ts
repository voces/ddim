import { serve } from "https://deno.land/std@0.155.0/http/server.ts";
import {
  initializeImageMagick,
} from "https://deno.land/x/imagemagick_deno@0.0.14/mod.ts";
import { toDds } from "./toDds.ts";
import { toPng } from "./toPng.ts";

await initializeImageMagick();

let page404 = "";
Deno.readTextFile("./page404.html").then((text) => page404 = text);

serve((req: Request) => {
  if (new URLPattern({ pathname: "/to-png" }).test(req.url)) return toPng(req);
  if (new URLPattern({ pathname: "/to-png" }).test(req.url)) return toDds(req);

  // if (new URLPattern({ pathname: "/to-dds" })) return toDds(req);
  return new Response(page404, { headers: { "Content-Type": "text/html" } });
}, { port: 8082 });
