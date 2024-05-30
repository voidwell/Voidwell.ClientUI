import { InjectionToken } from '@angular/core';
import { NavConfig } from '../models/navigation-item-config';

export const NAV_ITEMS_CONFIGS = new InjectionToken<NavConfig[]>('Navigation Item Config');
