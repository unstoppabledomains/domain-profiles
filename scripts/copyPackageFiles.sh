# Prepare the UI components package
pushd packages/ui-components
cp -rf CHANGELOG.md ../../README.md ../../LICENSE build/src
cat package.json | sed -e 's/build\/src\///g' | sed -e 's/workspace:\^/latest/g' > build/src/package.json
popd

# Prepare the config package
pushd packages/config
cp -rf CHANGELOG.md ../../README.md ../../LICENSE build/src
cat package.json | sed -e 's/build\/src\///g' | sed -e 's/workspace:\^/latest/g' > build/src/package.json
popd
