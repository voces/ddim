let uploaderHtml = "";

Deno.readTextFile("./uploader.html").then((text) => uploaderHtml = text);

export const getUploaderHtml = () => uploaderHtml;
