import { Routes } from '@angular/router';
import { Xor } from '@voidwell/common/utils';

export interface EagerRoutesConfig {
  authorized?: Routes;
  anonymous?: Routes;
}

export interface LazyRoutesConfig {
  lazy: Routes;
}

export function isLazyRoutesConfig(config: RoutesConfig): config is LazyRoutesConfig {
  return !!(config as LazyRoutesConfig & EagerRoutesConfig).lazy;
}

export type RoutesConfig = Xor<EagerRoutesConfig, LazyRoutesConfig>;
