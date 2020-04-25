export class ApiResourceConfig {
    public name: string;
    public enabled: boolean;
    public userClaims: ApiResourceClaim[];
    public displayName: string;
    public description: string
    public scopes: ApiResourceScope[];
    public properties: string[];
  
    constructor(resource?: any) {
      if (resource) {
        Object.assign(this, resource);
      } else {
        this.enabled = true;
      }
  
    }
  }
  
  export class ApiResourceClaim {
    constructor(
      public type: string,
      public value: string
    ) { }
  }

  export class ApiResourceScope {
    public id: string;
    public displayName: string;
    public description: string;
    public emphasize: boolean;
    public name: string;
    public required: boolean;
    public showInDiscoveryDocument: boolean;
    public userClaims: string[];

    constructor(scope?: any) {
      if (scope) {
        Object.assign(this, scope);
      } else {
        this.showInDiscoveryDocument = true;
      }
    }
  }
  
  