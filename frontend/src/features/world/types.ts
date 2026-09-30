export type World = {
  id: string;
  name: string;
  description: string;
  theme: string;
};
export type CreateWorld = Omit<World, "id">;
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
