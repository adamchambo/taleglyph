export type World = {
  id: string;
  name: string;
  description: string;
  theme: string;
  castSummary: string;
};
export type CreateWorld = Omit<World, "id" | "castSummary">;
export type Character = {
  id: string;
  worldId: string;
  name: string;
  role: string;
  description: string;
  motivation: string;
  canonStatus: "Draft" | "Canon";
};
export type CharacterInput = Omit<Character, "id" | "worldId">;
