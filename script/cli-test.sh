#!/bin/bash
rm -rf report/shell-tests
mkdir -p report/shell-tests
yarn cli object report/shell-tests/dest.json package.json tsconfig.json script/fixture/Example.elm
if [ ! -f "report/shell-tests/dest.json" ]; then
    echo "❌ KO dest.json"
    exit 1
fi