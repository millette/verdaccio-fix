// core
const { writeFileSync } = require("fs")

const fn = "package-lock.json"
const pkgLock = require([process.cwd(), fn].join("/"))

function run(fixFrom, fixTo) {
  const re = new RegExp(fixFrom)
  let r

  const fixes = {
    packages: 0,
    dependencies: 0,
    subDependencies: 0,
  }

  for (r in pkgLock.packages) {
    if (re.test(pkgLock.packages[r].resolved)) {
      fixes.packages++
      pkgLock.packages[r].resolved = pkgLock.packages[r].resolved.replace(
        re,
        fixTo
      )
    }
  }

  for (r in pkgLock.dependencies) {
    if (re.test(pkgLock.dependencies[r].resolved)) {
      fixes.dependencies++
      pkgLock.dependencies[r].resolved = pkgLock.dependencies[
        r
      ].resolved.replace(re, fixTo)
      for (const t in pkgLock.dependencies[r].dependencies) {
        if (re.test(pkgLock.dependencies[r].dependencies[t].resolved)) {
          fixes.subDependencies++
          pkgLock.dependencies[r].dependencies[t].resolved =
            pkgLock.dependencies[r].dependencies[t].resolved.replace(re, fixTo)

          for (const u in pkgLock.dependencies[r].dependencies[t].resolved) {
            if (
              pkgLock.dependencies[r].dependencies[t].dependencies &&
              re.test(
                pkgLock.dependencies[r].dependencies[t].dependencies[u].resolved
              )
            ) {
              fixes.subDependencies++
              pkgLock.dependencies[r].dependencies[t].dependencies[u].resolved =
                pkgLock.dependencies[r].dependencies[t].dependencies[
                  u
                ].resolved.replace(re, fixTo)
            }
          }
        }
      }
    }
  }

  console.log("URLs fixed from ", fixFrom, "to", fixTo)
  console.log(JSON.stringify(fixes, null, 2))

  writeFileSync(fn, JSON.stringify(pkgLock, null, 2))
}

module.exports = run
