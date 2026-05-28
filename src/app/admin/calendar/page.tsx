export const metadata = { title: "Calendar · Captor admin" };

export default function AdminCalendarPage() {
  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1 className="admin-page__title">Calendar</h1>
        <p className="lede">Full calendar view — coming next.</p>
      </header>
      <p className="admin-empty">
        This page will host the full month/week calendar with drag-to-reschedule,
        Google Calendar sync, and per-advisor filtering. The dashboard widget
        gives you the “this week” overview for now.
      </p>
    </div>
  );
}
