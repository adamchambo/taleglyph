import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { CoverageEditor } from "../../library/components/CoverageEditor";
import { WorkDetailsForm } from "../../library/components/WorkDetailsForm";
import type { Arc, StoryCard, StoryLink } from "../../library/types";

type Details = { title: string; coverAssetId: string | null };

/**
 * Title, cover and story coverage for a novel, kept out of the writing surface.
 * Built on the shared Modal (native <dialog> + showModal(); Esc and backdrop
 * click both route through onClose). It is mounted only while open, so form
 * drafts are discarded on close - the caller resets its dirty flag to match.
 */
export function NovelDetailsDialog({
  novel,
  stories,
  arcs,
  links,
  onSaved,
  onDirty,
  onLinksChanged,
  onClose,
}: {
  novel: { id: string; spaceId: string } & Details;
  stories: StoryCard[];
  /** null while the story graph is still loading. */
  arcs: Arc[] | null;
  links: StoryLink[];
  onSaved: (details: Details) => void;
  onDirty: (dirty: boolean) => void;
  onLinksChanged: (links: StoryLink[]) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Novel details" onClose={onClose}>
      <div className="novel-details">
        <WorkDetailsForm
          kind="novel"
          id={novel.id}
          spaceId={novel.spaceId}
          initial={{ title: novel.title, coverAssetId: novel.coverAssetId }}
          onSaved={onSaved}
          onDirty={onDirty}
        />
        {arcs ? (
          <CoverageEditor
            label="What this novel tells"
            fromKind="novel"
            fromId={novel.id}
            stories={stories}
            arcs={arcs}
            initial={links}
            onChanged={onLinksChanged}
          />
        ) : (
          <p className="novel-details-note">Loading story links…</p>
        )}
        <div className="novel-details-actions">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
