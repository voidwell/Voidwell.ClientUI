export class Secret {
    constructor(
      public description: string,
      public expiration: string,
      public type: string,
      public value: string
    ) { }
}