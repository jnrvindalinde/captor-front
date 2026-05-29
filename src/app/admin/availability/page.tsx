import { AvailabilityClient } from "./_AvailabilityClient";
import { getAvailabilityAction } from "./_actions";

export const metadata = { title: "Availability · Captor admin" };

export default async function AvailabilityPage() {
  const r = await getAvailabilityAction();
  const initial = r.ok ? r.data : null;
  const loadError = r.ok ? null : r.message;

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1 className="admin-page__title">Availability</h1>
        <p className="lede">
          Choose the days and times you&apos;re open for meetings. When a lead
          books, Captor only offers slots inside these windows — and skips any
          that conflict with your Google Calendar.
        </p>
      </header>

      {loadError && (
        <div className="admin-toast admin-toast--warn">
          Could not load availability: {loadError}
        </div>
      )}

      <AvailabilityClient initial={initial} />
    </div>
  );
}
