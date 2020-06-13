#!/usr/bin/env bash

echo "TEST_MATCH_IGNORE>>>"

cd ../..
pinf.it "./examples/02-CircleCI-Pipelines/#!inf.json"

echo "<<<TEST_MATCH_IGNORE"

echo "---"

cat "._/gi0.Sourcemint.org~sm.act/workflows/tests/02-CircleCI-Pipelines/01/workflow.yml"

echo "---"

cat "._/gi0.Sourcemint.org~sm.act/workflows/tests/02-CircleCI-Pipelines/02/workflow.yml"
