export class Secret {
    constructor(
      public id: string,
      public description: string,
      public expiration: string,
      public type: string,
      public value: string
    ) { }
}