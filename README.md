# npm-download

A simple cli tool to download npm package with all dependencies.

# Usage

```text
Usage: npd [options] [command]

Options:
  -V, --version         output the version number
  -d, --dry-run         run without install
  -r, --registry <url>  set registry
  --no-diff             run without diff.json
  -h, --help            display help for command

Commands:
  config-nexus <url>    config nexus url
  config-repo <repo>    config nexus repo name
  json <dir>            read from package.json in dir
  lock <dir>            read from package-lock.json in dir
  name <packages...>    read from package names
  top [n]               read from top (default top 200)
  types                 read from types-registry
  list                  list existing package and save to nexusRepo.json
  star                  manage star packages
  upload                upload packages in current dir
  help [command]        display help for command
```
