import { Routes } from '@angular/router';
import { DeadlockFilterService } from './data/deadlock-filter.service';
import { DeadlockWrapperComponent } from './deadlock-wrapper.component';
import { DeadlockOverviewComponent } from './overview/deadlock-overview.component';
import { DeadlockHeroesComponent } from './heroes/deadlock-heroes.component';
import { DeadlockHeroComponent } from './hero/deadlock-hero.component';
import { DeadlockHeroOverviewComponent } from './hero/overview/deadlock-hero-overview.component';
import { DeadlockHeroItemsComponent } from './hero/items/deadlock-hero-items.component';
import { DeadlockHeroBuildsComponent } from './hero/builds/deadlock-hero-builds.component';
import { DeadlockHeroMatchupsComponent } from './hero/matchups/deadlock-hero-matchups.component';
import { DeadlockHeroProgressionComponent } from './hero/progression/deadlock-hero-progression.component';
import { DeadlockItemsComponent } from './items/deadlock-items.component';
import { DeadlockMatchesComponent } from './matches/deadlock-matches.component';

/** Lazy route of the Deadlock area; the period, mode and rank filters live as long as the area is loaded. */
export const DEADLOCK_ROUTES: Routes = [
    {
        path: '',
        component: DeadlockWrapperComponent,
        providers: [DeadlockFilterService],
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: DeadlockOverviewComponent },
            { path: 'heroes', component: DeadlockHeroesComponent },
            {
                path: 'heroes/:id',
                component: DeadlockHeroComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: DeadlockHeroOverviewComponent },
                    { path: 'items', component: DeadlockHeroItemsComponent },
                    { path: 'builds', component: DeadlockHeroBuildsComponent },
                    { path: 'matchups', component: DeadlockHeroMatchupsComponent },
                    { path: 'progression', component: DeadlockHeroProgressionComponent }
                ]
            },
            { path: 'items', component: DeadlockItemsComponent },
            { path: 'matches', component: DeadlockMatchesComponent }
        ]
    }
];
