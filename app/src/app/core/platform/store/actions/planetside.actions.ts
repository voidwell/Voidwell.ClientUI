import { Action } from '@ngrx/store';
import { Ps2Platform } from '@core/api/models/ps2/common.model';

export enum PlanetsideActionTypes {
    CHANGE_PLATFORM = '[Planetside] CHANGE_PLATFORM'
}

export class ChangePlatform implements Action {
    readonly type = PlanetsideActionTypes.CHANGE_PLATFORM;
    constructor(public payload: { platform: Ps2Platform }) { }
}

export type PlanetsideActions =
    | ChangePlatform