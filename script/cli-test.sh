#!/bin/bash
rm -rf report/shell-tests
mkdir -p report/shell-tests
yarn cli --help
echo "---"
yarn cli test --help
echo "---"
yarn cli test2 --help