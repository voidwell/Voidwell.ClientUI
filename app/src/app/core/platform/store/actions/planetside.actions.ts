import { Action } from '@ngrx/store';

export enum PlanetsideActionTypes {
    CHANGE_PLATFORM = '[Planetside] CHANGE_PLATFORM'
}

export class ChangePlatform implements Action {
    readonly type = PlanetsideActionTypes.CHANGE_PLATFORM;
    constructor(public payload: { platform: string }) { }
}

export type PlanetsideActions =
    | ChangePlatform