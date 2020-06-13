#!/usr/bin/env bash

echo "TEST_MATCH_IGNORE>>>"

cd ../..
pinf.it "./examples/01-Github-Actions/#!inf.json"

echo "<<<TEST_MATCH_IGNORE"

echo "---"

cat "._/gi0.Sourcemint.org~sm.act/workflows/tests/01-Github-Actions/01/workflow.yml"

echo "---"

cat "._/gi0.Sourcemint.org~sm.act/workflows/tests/01-Github-Actions/02/workflow.yml"
