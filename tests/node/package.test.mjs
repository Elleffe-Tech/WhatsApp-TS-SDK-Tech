import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const repositoryRoot = resolve(import.meta.dirname, "../..");

function run(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, COREPACK_ENABLE_DOWNLOAD_PROMPT: "0" },
  });
}

test("the packed npm artifact installs and imports through its public ESM export", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "whatsapp-sdk-package-"));

  try {
    const pack = run(
      "pnpm",
      ["pack", "--pack-destination", workspace],
      repositoryRoot,
    );
    assert.equal(pack.status, 0, pack.stderr || pack.stdout);

    const tarballName = (await readdir(workspace)).find((name) =>
      name.endsWith(".tgz"),
    );
    assert.ok(tarballName, "pnpm pack did not produce a tarball");

    await writeFile(
      join(workspace, "package.json"),
      JSON.stringify({ private: true, type: "module" }),
    );

    const install = run(
      "npm",
      [
        "install",
        "--offline",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--no-package-lock",
        "--cache",
        join(workspace, ".npm-cache"),
        `./${tarballName}`,
        resolve(repositoryRoot, "node_modules/ky"),
      ],
      workspace,
    );
    assert.equal(install.status, 0, install.stderr || install.stdout);

    const installedRoot = join(
      workspace,
      "node_modules",
      "@elleffe-tech",
      "whatsapp",
    );
    const manifest = JSON.parse(
      await readFile(join(installedRoot, "package.json"), "utf8"),
    );

    assert.equal(manifest.type, "module");
    assert.deepEqual(manifest.exports, {
      ".": {
        import: {
          types: "./dist/index.d.ts",
          default: "./dist/index.js",
        },
      },
    });
    assert.deepEqual((await readdir(join(installedRoot, "dist"))).sort(), [
      "index.d.ts",
      "index.js",
      "index.js.map",
    ]);

    const importCheck = run(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        [
          'import DefaultClient, { Client, MessageType } from "@elleffe-tech/whatsapp";',
          'if (DefaultClient !== Client) throw new Error("default and named Client exports differ");',
          'if (Client.DEFAULT_GRAPH_VERSION !== "v25.0") throw new Error("package is not pinned to v25.0");',
          'if (MessageType.Text !== "text") throw new Error("runtime enums are not exported");',
        ].join("\n"),
      ],
      workspace,
    );
    assert.equal(
      importCheck.status,
      0,
      importCheck.stderr || importCheck.stdout,
    );
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
