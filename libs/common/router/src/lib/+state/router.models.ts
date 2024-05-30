import { ActivatedRouteSnapshot } from '@angular/router';

export interface ActivatedRouteSnapshotData extends Pick<ActivatedRouteSnapshot, 'url' | 'params' | 'data'> {
  componentTags: Record<string, unknown>; // Tags from component metadata
}

export class ActivatedRoutes {
  public currentRoute: ActivatedRouteSnapshotData;

  constructor(public pathFromRoot: ActivatedRouteSnapshotData[]) {
    this.currentRoute = this.pathFromRoot[this.pathFromRoot.length - 1];
  }

  /**
   * Get Parent Route
   * @param skip amount of parent routes to skip
   * skip = 0 will return closest parent while skip = 1 will return parent of the parent and so on
   */
  public getParent(skip = 0) {
    return this.pathFromRoot[this.pathFromRoot.length - 2 - skip];
  }
}
