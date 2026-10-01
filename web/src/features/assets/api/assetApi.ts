import { apiClient } from "../../../lib/apiClient";
import { config } from "../../../lib/config";
import type { Asset } from "../types";
export const assetApi = {
  list: (worldId: string, signal?: AbortSignal) =>
    apiClient<Asset[]>(`/assets?worldId=${worldId}`, { signal }),
  upload: (worldId: string, name: string, file: File) => {
    const body = new FormData();
    body.append("worldId", worldId);
    body.append("name", name);
    body.append("file", file);
    return apiClient<Asset>("/assets/upload", { method: "POST", body });
  },
  image: (asset: Asset) =>
    asset.imageUrl ? `${config.apiBaseUrl}/assets/${asset.id}/image` : "",
};
