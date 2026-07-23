import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = resolve(".openai", "hosting.json");
const target = resolve("dist", ".openai", "hosting.json");

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);

console.log("Copied Sites hosting metadata into the deployment bundle.");
