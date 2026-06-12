import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectId = "13990767071446712286";
const outDir = path.resolve("stitch-assets");
const screensDir = path.join(outDir, "screens");

const baseParams = new URLSearchParams({
  "source-path": `/projects/${projectId}`,
  bl: "boq_pitchfork-nemo-ui_20260604.06_p0",
  "f.sid": "9115949061180149628",
  hl: "en",
  rt: "c",
});

async function postBatch(rpcid, request, reqId) {
  const url = new URL("https://stitch.withgoogle.com/_/Nemo/data/batchexecute");
  url.searchParams.set("rpcids", rpcid);
  for (const [key, value] of baseParams.entries()) url.searchParams.set(key, value);
  url.searchParams.set("_reqid", String(reqId));

  const form = new URLSearchParams();
  form.set("f.req", JSON.stringify([[[rpcid, JSON.stringify(request), null, "generic"]]]));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: form,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${rpcid} failed: ${res.status} ${text.slice(0, 300)}`);
  }
  return text;
}

function parseBatch(text, rpcid) {
  const lines = text.split(/\r?\n/).filter((line) => line && line !== ")]}'" && !/^\d+$/.test(line));
  const row = lines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .flat()
    .find((item) => Array.isArray(item) && item[0] === "wrb.fr" && item[1] === rpcid);

  if (!row) throw new Error(`No wrb.fr row for ${rpcid}`);
  return JSON.parse(row[2]);
}

function screenFromTuple(tuple) {
  const screenshotFile = Array.isArray(tuple[0]) ? tuple[0] : null;
  const htmlFile = Array.isArray(tuple[1]) ? tuple[1] : null;
  return {
    id: tuple[4],
    agent: tuple[5],
    width: Number(tuple[6]),
    height: Number(tuple[7]),
    title: tuple[8] || tuple[4],
    prompt: tuple[9] || null,
    name: tuple[10] || null,
    resourceName: tuple[11] || null,
    screenshotUrl: screenshotFile?.[2] || null,
    htmlUrl: htmlFile?.[2] || null,
    htmlContentType: htmlFile?.[5] || null,
  };
}

function safeFileName(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function download(url, filePath) {
  const res = await fetch(url);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  await writeFile(filePath, bytes);
  return { filePath, bytes: bytes.byteLength, contentType: res.headers.get("content-type") };
}

await mkdir(screensDir, { recursive: true });

const projectRaw = await postBatch("eW2RYb", [`projects/${projectId}`], 810001);
await writeFile(path.join(outDir, "get-project.raw.txt"), projectRaw);
const projectData = parseBatch(projectRaw, "eW2RYb");
await writeFile(path.join(outDir, "get-project.parsed.json"), JSON.stringify(projectData, null, 2));

const screensRaw = await postBatch("ErneX", [`projects/${projectId}`], 810002);
await writeFile(path.join(outDir, "list-screens.raw.txt"), screensRaw);
const screensData = parseBatch(screensRaw, "ErneX");
await writeFile(path.join(outDir, "list-screens.parsed.json"), JSON.stringify(screensData, null, 2));

const screenTuples = (screensData?.[0] || []).filter(Array.isArray);
const screens = screenTuples.map(screenFromTuple).filter((screen) => screen.id);

const downloads = [];
for (const screen of screens) {
  const prefix = `${safeFileName(screen.title)}-${screen.id}`;
  if (screen.htmlUrl) {
    downloads.push({
      id: screen.id,
      kind: "html",
      ...(await download(screen.htmlUrl, path.join(screensDir, `${prefix}.html`))),
    });
  }
  if (screen.screenshotUrl) {
    downloads.push({
      id: screen.id,
      kind: "screenshot",
      ...(await download(screen.screenshotUrl, path.join(screensDir, `${prefix}.png`))),
    });
  }
}

const manifest = {
  projectId,
  projectTitle: projectData?.[1] || null,
  screenCount: screens.length,
  screens,
  downloads,
  generatedAt: new Date().toISOString(),
};

await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Saved ${downloads.length} files for ${screens.length} screens to ${screensDir}`);
