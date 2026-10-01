import { useState } from "react";
import { libraryApi } from "../api/libraryApi";
import { Icon } from "../../../components/ui/Icon";
export function StoryArtwork({
  assetId,
  title,
  variant = 0,
}: {
  assetId: string | null;
  title: string;
  variant?: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`story-art art-${variant % 4}`}>
      {assetId && !failed ? (
        <img
          src={libraryApi.cover(assetId)}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cover-placeholder">
          <span className="cover-orbit" />
          <Icon name="spark" size={34} />
          <span>{title}</span>
        </div>
      )}
      <span className="art-shade" />
    </div>
  );
}
