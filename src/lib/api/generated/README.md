# Reserved for verified OpenAPI generated types

The current `../types.ts` DTOs remain a manually transcribed snapshot of backend v0.2. Do not generate from the provisional checked-in schema. After Django exports and validates canonical OpenAPI, generate types into this directory using a pinned generator, and use a thin, reviewed adapter at `../types.ts`. Keep `../client.ts` and application consumers stable. Do not edit generated files by hand. CI must detect contract drift. No file endpoints are defined in v0.2.
