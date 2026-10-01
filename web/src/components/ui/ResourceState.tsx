import { Button } from "./Button";
export function ResourceState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry?: () => void;
}) {
  if (loading) return <p role="status">Loading…</p>;
  if (error)
    return (
      <div role="alert" className="error">
        <p>{error}</p>
        {retry ? <Button onClick={retry}>Try again</Button> : null}
      </div>
    );
  return null;
}
