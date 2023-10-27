# Prepare the UI components package
cd packages/ui-components
cp -rf CHANGELOG.md ../../README.md ../../LICENSE build/src
cat package.json | sed -e 's/build\/src\///g' | sed -e 's/workspace:\^/latest/g' | sed -e 's/"private": true/"private": false/g' > build/src/package.json
cd ../

# Prepare the config package
cd packages/config
cp -rf CHANGELOG.md ../../README.md ../../LICENSE build/src
cat package.json | sed -e 's/build\/src\///g' | sed -e 's/workspace:\^/latest/g' | sed -e 's/"private": true/"private": false/g' > build/src/package.json
cd ../
