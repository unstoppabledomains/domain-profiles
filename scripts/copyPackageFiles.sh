#!/bin/bash

# Ensure the script exits on any command failure
set -e

# Function to prepare an NPM package
prepare_package() {
  local package_dir=$1

  echo "Copying files for ${package_dir}..."

  cd $package_dir \
    && cp -rf CHANGELOG.md ../../README.md ../../LICENSE build/src \
    && cat package.json | sed -e 's/build\/src\///g' \
      -e 's/workspace:\^/latest/g' \
      -e 's/"private": true/"private": false/g' > build/src/package.json \
    && cd ../../

  echo "Done."
}

# Prepare the UI components package
prepare_package "packages/ui-components"

# Prepare the config package
prepare_package "packages/config"
