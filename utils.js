/**
 * Utility Methods
 *
 * Credit: Kent C. Dodds
 *
 * @see https://github.com/kentcdodds/kcd-scripts/blob/main/src/utils.js
 */
import fs from 'node:fs';
import { cosmiconfigSync } from 'cosmiconfig';
import has from 'lodash.has';
import { readPackageUpSync } from 'read-package-up';

const { packageJson: pkg, path: pkgPath } = readPackageUpSync({ cwd: fs.realpathSync(process.cwd()) }) || {};

const hasPkgProp = props => [props].flat().some(prop => has(pkg, prop));
const hasPkgSubProp = pkgProp => props => hasPkgProp([props].flat().map(p => `${pkgProp}.${p}`));

export const hasDep = hasPkgSubProp('dependencies');

export const hasDevDep = hasPkgSubProp('devDependencies');
export const hasPeerDep = hasPkgSubProp('peerDependencies');
export const hasAnyDep = args => [hasDep, hasDevDep, hasPeerDep].some(fn => fn(args));

export const ifAnyDep = (deps, t, f) => (hasAnyDep([deps].flat()) ? t : f);

export function hasLocalConfig(moduleName, searchOptions = {}) {
  const explorerSync = cosmiconfigSync(moduleName, searchOptions);
  const result = explorerSync.search(pkgPath || './');

  return result !== null;
}
