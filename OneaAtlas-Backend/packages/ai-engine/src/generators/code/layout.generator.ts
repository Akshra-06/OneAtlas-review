import type {
  AppRouteConfig,
  GeneratedFile,
} from '@oneatlas/shared';

export const generateLayouts = (
  routeConfig: AppRouteConfig,
  appName: string,
): GeneratedFile[] => {
  return [];
};

export const layoutGenerator = {
  generate: generateLayouts,
};

export default layoutGenerator;
