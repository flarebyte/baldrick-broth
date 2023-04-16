#!/bin/bash

npx zx https://raw.githubusercontent.com/flarebyte/baldrick-reserve/main/reserve-schema/schema-to-md.mjs --schema spec/snapshots/build-model/get-schema--schema.json --md SCHEMA.md --title "baldrick-broth"
yarn cli md fix