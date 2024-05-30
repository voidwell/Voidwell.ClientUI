import { NavConfigFn } from './navigation-item-config';

export interface NavigationConfigProvider {
  resolveNavConfig: NavConfigFn;
}
