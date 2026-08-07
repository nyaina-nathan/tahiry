export type Mutation =
  | { type: "create" }
  | { type: "update"; id: string }
  | { type: "delete"; id: string }
  | null;
