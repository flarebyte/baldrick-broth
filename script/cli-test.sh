#!/bin/bash
rm -rf report/shell-tests
mkdir -p report/shell-tests
BALDRICK_BROTH_BUILD_FILE=script/fixture/.baldrick-broth/dev.yaml yarn cli --help
echo "---"
BALDRICK_BROTH_BUILD_FILE=script/fixture/.baldrick-broth/dev.yaml yarn cli test --help
echo "---"
BALDRICK_BROTH_BUILD_FILE=script/fixture/.baldrick-broth/dev.yaml yarn cli test generate --help