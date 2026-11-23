import { Component, computed, inject } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { HeroAnalyticsRepository } from '@core/api/deadlock/hero-analytics.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { changeClass, formatMinutes, formatPercent, formatPoints, titleCase } from '../../data/deadlock-figures';
import { deadlockResource } from '../../data/deadlock-resource';
import { DeadlockHeroContext } from '../deadlock-hero-context.service';

/** The item build looks at no more than this many days. */
const ITEM_BUILD_MAX_DAYS = 60;

const STOP_REASONS: Record<string, string> = {
    maxItems: 'The build is full.',
    notEnoughGames: 'Too few games had every item so far to compare another one.',
    noBetterItem: 'No other item raised the win rate by more than chance could explain.'
};

@Component({
    templateUrl: './deadlock-hero-builds.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, DecimalPipe, PercentPipe, NgClass, LoaderComponent]
})
export class DeadlockHeroBuildsComponent {
    private readonly repository = inject(HeroAnalyticsRepository);
    private readonly hero = inject(DeadlockHeroContext);

    /** The build is worked out from every game, so it covers a shorter period than the other figures when the filter is longer. */
    readonly itemBuild = deadlockResource(
        (query, id: number) => this.repository.getItemBuild(id, { ...query, days: query.days === undefined ? undefined : Math.min(query.days, ITEM_BUILD_MAX_DAYS) }),
        () => this.hero.heroId());
    readonly shapes = deadlockResource((query, id: number) => this.repository.getBuildShapes(id, query), () => this.hero.heroId());
    readonly community = deadlockResource((query, id: number) => this.repository.getCommunityBuilds(id, query), () => this.hero.heroId());
    readonly abilities = deadlockResource((query, id: number) => this.repository.getAbilityOrder(id, query), () => this.hero.heroId());

    readonly formatPoints = formatPoints;
    readonly formatPercent = formatPercent;
    readonly formatMinutes = formatMinutes;
    readonly changeClass = changeClass;
    readonly titleCase = titleCase;

    readonly stopReason = computed(() => STOP_REASONS[this.itemBuild.value()?.stopReason ?? ''] ?? null);

    /** The slot splits, most played first. */
    readonly shapeRows = computed(() => [...(this.shapes.value()?.shapes ?? [])].sort((a, b) => b.games - a.games));

    /** The abilities, most learned first. */
    readonly abilityRows = computed(() => [...(this.abilities.value()?.abilities ?? [])].sort((a, b) => b.games - a.games));

    /** The suggested level-up order as ability names, each with its place. */
    readonly suggestedOrder = computed(() => {
        const data = this.abilities.value();
        const names = new Map((data?.abilities ?? []).map(ability => [ability.abilityId, ability.name]));
        return (data?.suggestedOrder ?? []).map((id, index) => ({ place: index + 1, name: names.get(id) ?? `Ability ${id}` }));
    });
}
