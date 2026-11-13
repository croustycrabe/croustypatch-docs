# CroustyPatch documentation site

Static Next.js site: home page, user guide (`content/user/`) and technical documentation (`content/tech/`).
Pages are Markdown with front matter (`title`, `description`, `order`, `group`); add a file and it appears in the sidebar and in search.

```sh
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in out/
```

The output in `out/` is plain static files, to be served by any web server.

## Product screenshots

`public/shots/` holds WebP screenshots of the real web interface with invented demo data (light and dark, plus a phone view), listed in `public/shots/manifest.json`. The home page slider and feature tabs read that manifest at build time; name files `<name>-light.webp` / `<name>-dark.webp` and add them to the manifest to show a new one.
