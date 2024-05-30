export interface LinkNavItem {
  icon: string;
  link?: string;
  name: string;
  subItems?: LinkNavItem[];
  enabled: boolean;
  exact: boolean;
}

export interface NavigationMap {
  side: LinkNavItem[];
}
