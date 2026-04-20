import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, "src/manifest.json");
const assetsRoot = path.join(projectRoot, "public/assets");
const outputPath = path.join(projectRoot, "src/manifest.inline.generated.js");

const MIME_TYPES = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json",
};

const toDataUri = (buffer, mimeType, virtualFileName) => {
  const safeName = encodeURIComponent(virtualFileName);
  return `data:${mimeType};filename=${safeName};base64,${buffer.toString("base64")}`;
};

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
};

const toPosixPath = (value) => value.split(path.sep).join(path.posix.sep);

const loadBinaryAsDataUri = (assetRelativePath) => {
  const absolutePath = path.join(assetsRoot, assetRelativePath);
  const data = fs.readFileSync(absolutePath);
  return toDataUri(data, getMimeType(absolutePath), assetRelativePath);
};

const inlineTextureAtlasJson = (assetRelativePath) => {
  const normalizedAssetPath = toPosixPath(assetRelativePath); 
  const absolutePath = path.join(assetsRoot, normalizedAssetPath);
  const parsed = JSON.parse(fs.readFileSync(absolutePath, "utf8"));

  if (parsed?.meta?.image) {
    const imageRelativePath = toPosixPath(
      path.posix.join(path.posix.dirname(normalizedAssetPath), parsed.meta.image),
    );
    parsed.meta.image = loadBinaryAsDataUri(imageRelativePath);
  }

  return toDataUri(Buffer.from(JSON.stringify(parsed)), "application/json", normalizedAssetPath);
};

const inlineAsset = (assetRelativePath) => {
  if (assetRelativePath.endsWith(".json")) {
    return inlineTextureAtlasJson(assetRelativePath);
  }

  return loadBinaryAsDataUri(assetRelativePath);
};

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const inlineManifest = {
  ...manifest,
  bundles: manifest.bundles.map((bundle) => ({
    ...bundle,
    assets: bundle.assets.map((asset) => ({
      ...asset,
      src: asset.src.map((assetPath) => inlineAsset(assetPath)),
    })),
  })),
};

const outputSource = `// Auto-generated file for inline builds. Do not edit manually.\nexport default ${JSON.stringify(inlineManifest, null, 2)};\n`;

fs.writeFileSync(outputPath, outputSource, "utf8");
console.log(`Generated inline manifest at: ${path.relative(projectRoot, outputPath)}`);
