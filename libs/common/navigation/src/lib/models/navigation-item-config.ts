import { Observable } from 'rxjs';

export interface Orderable {
  order?: number;
}

export interface LinkNavItemConfig extends Orderable {
  icon?: string;
  link: string;
  name: string;
  subItems?: LinkNavItemConfig[];
  enabled?: boolean;
  exact?: boolean;
}

export interface NavConfig {
  side?: LinkNavItemConfig[];
}

export type NavConfigFn = () => Observable<NavConfig>;
