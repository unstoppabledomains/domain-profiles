/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const {readdir, writeFile} = require('fs').promises;

const basePath = 'packages/ui-components/build';

createModulePackages()
  .then(() => console.log('Module packages were successfully created!'))
  .catch(err => {
    console.log('Something went wrong while creating package.json files...');
    console.error(err);
  });

/**
 * Recursively puts a package.json into all child directories (excluding `esm`) of the built `build` dir,
 * starting with the top-level modules
 *
 * @param {string} [packagesDirPath] - Parent directory whose children will be processed (starting with `build`).
 * @param {number} [level] - Level of the parent directory relatively to `build`.
 * @returns {Promise<Awaited<void>[]>} - Array of promises that resolve when all package.json files are created.
 */
async function createModulePackages(
  packagesDirPath = path.resolve(__dirname, `../${basePath}`),
  level = 1,
) {
  const packagesDir = await readdir(packagesDirPath, {
    withFileTypes: true,
  });

  const packageNames = packagesDir
    .filter(dir => dir.isDirectory() && dir.name !== 'esm')
    .map(dir => dir.name);

  const createPackageJsonFiles = packageNames.map(async packageName => {
    const packageDirPath = `${packagesDirPath}/${packageName}`;

    const packageDir = await readdir(packageDirPath, {
      withFileTypes: true,
    });

    const containsDirs = packageDir.some(dir => dir.isDirectory());

    if (containsDirs) {
      await createModulePackages(packageDirPath, level + 1);
    }

    const [, subBuildDirName] = packagesDirPath.split('build');
    const packageJsonFileContents = generatePackageJsonFileContents(
      `${subBuildDirName}/${packageName}`,
      level,
    );
    if (packageJsonFileContents) {
      return writeFile(
        `${packageDirPath}/package.json`,
        JSON.stringify(packageJsonFileContents, null, 2),
      );
    }
  });

  return Promise.all(createPackageJsonFiles);
}

/**
 * Generates contents for each package.json file that contains information
 * about both the ECMAScript Modules (i.e. ESM or ES Modules) and CommonJS Modules (CJS)
 * for bundlers to support tree-shakeable imports and tools like Jest to parse non-standard JavaScript syntax.
 *
 * @param {string} packagePath - Path of the package relatively to the `build` directory.
 * @param {number} [level] - Level of the current directory relatively to the `build` directory.
 * @returns {{sideEffects: boolean, module: string, main: string, types: string}} - Contents of the package.json file.
 */
function generatePackageJsonFileContents(packagePath, level = 1) {
  const parentPaths = '../'.repeat(level);
  const maybeModule = `${basePath}${packagePath}/index.js`;
  if (!fs.existsSync(maybeModule)) {
    console.log(`no package: ${maybeModule}`);
    return undefined;
  }

  return {
    sideEffects: false,
    module: `${parentPaths.slice(
      0,
      parentPaths.length - 1,
    )}${packagePath}/index.js`,
    main: './src/index.js',
    types: './src/index.d.ts',
  };
}
