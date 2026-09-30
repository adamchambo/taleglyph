import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { ResourceState } from "../../../components/ui/ResourceState";
import { Button } from "../../../components/ui/Button";
import { worldApi } from "../api/worldApi";
export function WorldOverviewPage() {
  const worlds = useResource(worldApi.list);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await worldApi.create({ name, description, theme: "fantasy" });
      setName("");
      setDescription("");
      worlds.reload();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create world.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <p className="eyebrow">Every story begins somewhere</p>
      <h1>Your worlds</h1>
      <p className="intro">
        A shared home for your characters, places, and the stories they become.
      </p>
      <ResourceState
        loading={worlds.loading}
        error={worlds.error}
        retry={worlds.reload}
      />
      <div className="cards">
        {worlds.data?.map((world) => (
          <article className="card" key={world.id}>
            <small>Story world</small>
            <h2>
              <Link to={`/worlds/${world.id}`}>{world.name}</Link>
            </h2>
            <p>{world.description}</p>
          </article>
        ))}
      </div>
      {worlds.data?.length === 0 ? (
        <p>No worlds yet. Create your first one below.</p>
      ) : null}
      <form className="form" onSubmit={create}>
        <fieldset disabled={busy}>
          <legend>Create a world</legend>
          <label>
            World name
            <input
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          {error ? (
            <p role="alert" className="error">
              {error}
            </p>
          ) : null}
          <Button type="submit">{busy ? "Creating…" : "Create world"}</Button>
        </fieldset>
      </form>
    </section>
  );
}
