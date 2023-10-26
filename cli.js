#!/usr/bin/env node

// node
import { readFile, writeFile } from "node:fs/promises"
import { basename } from "node:path"

// npm
import fg from "fast-glob"

const fixFrom = "http://localhost:4873/"
const fixTo = "https://registry.npmjs.org/"
const fixToY = "https://registry.yarnpkg.com/"
const lockFiles = ["yarn.lock", "package-lock.json", "pnpm-lock.yaml"]
const options = { cwd: process.cwd(), absolute: true }

function rep(cnt2, fix) {
  const cnt = cnt2.replaceAll(fixFrom, fix)
  return {
    cnt,
    fixes: (cnt.length - cnt2.length) / (fix.length - fixFrom.length),
  }
}

async function run() {
  const fixed = []
  for await (const entry of fg.stream(lockFiles, options)) {
    const lockfile = basename(entry)
    let cnt2 = await readFile(entry, "utf-8")
    const { cnt, fixes } = rep(cnt2, lockfile === lockFiles[0] ? fixToY : fixTo)
    if (fixes) {
      await writeFile(entry, cnt)
      fixed.push({ lockfile, fixes })
    }
  }
  return fixed
}

try {
  const res = await run()
  console.log(res)
} catch (e) {
  console.error(e)
}
