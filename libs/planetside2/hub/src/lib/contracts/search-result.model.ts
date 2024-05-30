import { Xor } from "@voidwell/common/utils";
import { SearchType } from "../models/search-type.model";

export interface SearchResultBase {
  type: SearchType
}

export interface CharacterSearchResult extends SearchResultBase {
  name: string,
  id: string,
  battleRank: number,
  factionId: number,
  worldId: number
}

export interface OutfitSearchResult extends SearchResultBase {
  name: string,
  id: string,
  factionId: number,
  worldId: number,
  alias: string,
  memberCount: number
}

export interface WeaponSearchResult extends SearchResultBase {
  name: string,
  id: string,
  factionId: number,
  categoryId: number,
}

export type SearchResult = Xor<CharacterSearchResult, Xor<OutfitSearchResult, WeaponSearchResult>>;