import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const EXPECTED_STATUS_ID: string = "2123973433340072359";
const MAX_POST_BYTES: number = 16384;
const POST_URL_PATTERN: RegExp = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/(\d+)$/;

function fail(message: string): never {
  console.error(`gta6-meme-x-r3-aimcuk: error: ${message}`);
  process.exit(1);
}

function main(): void {
  const botDir: string = process.env.MAKEFUN_BOT_DIR ?? "/bot";
  const outputDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const postPath: string = join(botDir, "POST.json");

  if (!existsSync(postPath)) {
    fail(`POST.json not found in bot directory "${botDir}" (expected at ${postPath})`);
  }

  const size: number = statSync(postPath).size;
  if (size > MAX_POST_BYTES) {
    fail(`POST.json is too large (${size} bytes, limit is ${MAX_POST_BYTES})`);
  }

  const raw: string = readFileSync(postPath, "utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("POST.json is not valid JSON");
  }

  const url: unknown =
    parsed !== null && typeof parsed === "object"
      ? (parsed as { url?: unknown }).url
      : undefined;

  if (typeof url !== "string") {
    fail('POST.json field "url" must be a string');
  }

  const match: RegExpExecArray | null = POST_URL_PATTERN.exec(url);
  if (match === null) {
    fail(`POST.json url "${url}" is not a valid X status URL`);
  }

  const statusId: string = match[1];
  if (statusId !== EXPECTED_STATUS_ID) {
    fail(`unexpected status id "${statusId}", expected "${EXPECTED_STATUS_ID}"`);
  }

  mkdirSync(outputDir, { recursive: true });
  const destination: string = join(outputDir, "POST.json");
  copyFileSync(postPath, destination);

  console.log(
    "Leonida Pizza thermal receipt: copied POST.json to " + destination,
  );
  console.log(
    "Meme concept: LEONIDA PIZZA thermal delivery receipt strip - ordered 2013, delivered 2026, total $2,026 paid by my AI agent, stamped STILL WARM (EMOTIONALLY).",
  );
}

main();
