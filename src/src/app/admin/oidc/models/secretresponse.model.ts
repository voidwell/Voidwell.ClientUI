import { Secret } from "./secret.model";

export class SecretResponse {
    constructor(
      public value: string,
      public model: Secret,
    ) { }
}