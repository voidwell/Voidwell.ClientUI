import { Type } from '@angular/core';
import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';
import { ActivatedRouteSnapshotData } from '../+state/router.models';
import { RouterState } from '../+state/router.state';
import { getTags, isType } from '../utils';

export class CommonRouteSerializer implements RouterStateSerializer<RouterState> {
  public serialize(routerState: RouterStateSnapshot): RouterState {
    let route = routerState.root;
    let pathParams = route.params;
    const routesComponents: Type<any>[] = this.addComponent([], route.routeConfig?.component);

    while (route.firstChild) {
      route = route.firstChild;

      this.addComponent(routesComponents, route.routeConfig?.component);
      pathParams = { ...pathParams, ...route.params };
    }

    return {
      url: routerState.url,
      pathParams: pathParams,
      queryParams: routerState.root.queryParams,
      /**
       * Skipping for 2 routes because they do not have any useful info:
       * - first one is Angular empty root route (doesn't have associated config object)
       * - second on is Root route with root Guards defined in CommonRouter Configuration service.
       */
      pathFromRoot: route.pathFromRoot.slice(2).map(x => this.map(x)),
      /**
       * Wrapping active components into function to avoid serializing components' classes
       */
      getRoutesComponents: () => routesComponents
    };
  }

  private addComponent(array: Type<any>[], component: Type<any> | undefined) {
    if (component) {
      array.push(component);
    }
    return array;
  }

  private map(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshotData {
    return {
      url: snapshot.url,
      params: snapshot.params,
      data: snapshot.data,
      componentTags: getTags(this.getRouteComponent(snapshot)) || {}
    };
  }

  private getRouteComponent(route: ActivatedRouteSnapshot): Type<unknown> | null {
    let component = route.component;
    if (!component) {
      // try to get default route for root componentless route if it's not activated
      const defaultChildRoute = route.routeConfig?.children?.find(r => !r.path || r.path === '');
      if (defaultChildRoute && defaultChildRoute !== route.firstChild?.routeConfig) {
        let childRoute: Route | undefined = defaultChildRoute;

        while (childRoute != null && !childRoute.component) {
          childRoute = childRoute.children?.find(r => !r.path || r.path === '');
        }
        component = childRoute?.component || null;
      }
    }

    return isType(component) ? component : null;
  }
}
