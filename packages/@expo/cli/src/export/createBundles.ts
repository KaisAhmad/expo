import { getConfig, Platform, ProjectTarget } from '@expo/config';

import { bundleAsync, BundleOutput } from './fork-bundleAsync';
import { getEntryWithServerRoot } from '../start/server/middleware/ManifestMiddleware';

export type PublishOptions = {
  releaseChannel?: string;
  target?: ProjectTarget;
  resetCache?: boolean;
  maxWorkers?: number;
};

// TODO: Reduce layers of indirection
export async function createBundlesAsync(
  projectRoot: string,
  publishOptions: PublishOptions = {},
  bundleOptions: { platforms: Platform[]; dev?: boolean; minify?: boolean }
): Promise<Partial<Record<Platform, BundleOutput>>> {
  if (!bundleOptions.platforms.length) {
    return {};
  }
  const projectConfig = getConfig(projectRoot, { skipSDKVersionRequirement: true });
  const { exp } = projectConfig;

  const bundles = await bundleAsync(
    projectRoot,
    exp,
    {
      // If not legacy, ignore the target option to prevent warnings from being thrown.
      resetCache: publishOptions.resetCache,
      maxWorkers: publishOptions.maxWorkers,
      quiet: false,
    },
    bundleOptions.platforms.map((platform: Platform) => ({
      platform,
      entryPoint: getEntryWithServerRoot(projectRoot, projectConfig, platform),
      minify: bundleOptions.minify,
      dev: bundleOptions.dev,
    }))
  );

  // { ios: bundle, android: bundle }
  return bundleOptions.platforms.reduce<Partial<Record<Platform, BundleOutput>>>(
    (prev, platform, index) => ({
      ...prev,
      [platform]: bundles[index],
    }),
    {}
  );
}
