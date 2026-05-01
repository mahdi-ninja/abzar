import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = "out";
const FILE_NAME = "version.json";
const HEADERS_FILE = "_headers";

function execGit(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

function firstDefined(...values) {
  return values.find((value) => typeof value === "string" && value.length > 0);
}

function deploymentProvider() {
  if (process.env.CF_PAGES === "1") return "cloudflare-pages";
  if (process.env.VERCEL === "1") return "vercel";
  if (process.env.GITHUB_ACTIONS === "true") return "github-actions";
  return "local";
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));

const envCommit = firstDefined(
  process.env.CF_PAGES_COMMIT_SHA,
  process.env.VERCEL_GIT_COMMIT_SHA,
  process.env.GITHUB_SHA,
  process.env.COMMIT_SHA,
  process.env.SOURCE_VERSION,
);
const gitCommit = execGit(["rev-parse", "HEAD"]);
const commit = firstDefined(envCommit, gitCommit);

const branch = firstDefined(
  process.env.CF_PAGES_BRANCH,
  process.env.VERCEL_GIT_COMMIT_REF,
  process.env.GITHUB_REF_NAME,
  execGit(["branch", "--show-current"]),
);

const dirtyStatus = execGit(["status", "--porcelain"]);
const builtAt = new Date();

const deploymentInfo = {
  schemaVersion: 1,
  app: packageJson.name,
  packageVersion: packageJson.version,
  builtAt: builtAt.toISOString(),
  builtAtEpochMs: builtAt.getTime(),
  git: {
    commit: commit ?? null,
    shortCommit: commit ? commit.slice(0, 7) : null,
    branch: branch ?? null,
    dirty: dirtyStatus === undefined ? null : dirtyStatus.length > 0,
    source: envCommit ? "environment" : gitCommit ? "git" : "unknown",
  },
  deployment: {
    provider: deploymentProvider(),
    url:
      firstDefined(
        process.env.CF_PAGES_URL,
        process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
      ) ?? null,
  },
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  join(OUT_DIR, FILE_NAME),
  `${JSON.stringify(deploymentInfo, null, 2)}\n`,
);

const headersPath = join(OUT_DIR, HEADERS_FILE);
const headersEntry = `/${FILE_NAME}\n  Cache-Control: no-store\n`;
let headers = "";
try {
  headers = await readFile(headersPath, "utf8");
} catch {
  // No Cloudflare Pages headers file exists yet.
}

if (!headers.includes(`/${FILE_NAME}`)) {
  const separator = headers.length > 0 && !headers.endsWith("\n") ? "\n" : "";
  await writeFile(headersPath, `${headers}${separator}${headersEntry}`);
}

console.log(
  `Version info generated: ${OUT_DIR}/${FILE_NAME} (${deploymentInfo.git.shortCommit ?? "unknown"})`,
);
