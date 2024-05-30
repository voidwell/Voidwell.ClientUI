import { createReducer, on } from "@ngrx/store";
import { loadSearchSuccess, loadSearchFailure, changePlatform, changeSearchType, updateSearchQuery, loadSearch } from "./actions";
import { LoadStatus } from '@voidwell/common/utils';
import { SearchResult } from "../contracts/search-result.model";
import { PlatformType } from "../models/platform-type.model";
import { SearchType } from "../models/search-type.model";

export interface HubState {
  platformType: PlatformType;
  searchType: SearchType;
  searchStatus: LoadStatus;
  searchError: unknown;
  searchResults: SearchResult[];
  searchQuery: string;
}
  
export const initialState: HubState = {
  platformType: PlatformType.PC,
  searchStatus: LoadStatus.Pristine,
  searchType: SearchType.Player,
  searchQuery: '',
  searchError: undefined,
  searchResults: []
};

export const reducer = createReducer(
  initialState,
  on(changePlatform, (state, action) => ({
    ...state,
    platformType: action.platformType,
    searchStatus: LoadStatus.Pristine,
    searchError: undefined,
    searchResults: []
  })),
  on(changeSearchType, (state, action) => ({
    ...state,
    searchType: action.searchType,
    searchStatus: LoadStatus.Pristine,
    searchError: undefined,
    searchResults: []
  })),
  on(updateSearchQuery, (state, action) => ({
    ...state,
    searchQuery: action.searchQuery,
    searchStatus: LoadStatus.Pristine,
    searchError: undefined,
    searchResults: []
  })),
  on(loadSearch, (state) => ({
    ...state,
    searchStatus: LoadStatus.Loading
  })),
  on(loadSearchSuccess, (state, action) => ({
    ...state,
    searchStatus: LoadStatus.Loaded,
    searchResults: action.results
  })),
  on(loadSearchFailure, (state, action) => ({
    ...state,
    searchStatus: LoadStatus.Failed,
    searchError: action.error
  }))
);
