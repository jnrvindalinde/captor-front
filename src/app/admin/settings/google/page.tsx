import { apiFetch } from "@/lib/api";
import { GoogleConnectClient } from "./GoogleConnectClient";

export const metadata = { title: "Google Calendar · Captor admin" };

type Status = {
  connected: boolean;
  email: string | null;
  expires_at: string | null;
};

export default async function GoogleSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reason?: string }>;
}) {
  const sp = await searchParams;

  let status: Status = { connected: false, email: null, expires_at: null };
  try {
    status = await apiFetch<Status>("/api/admin/google/status");
  } catch {
    // unauth or backend down — render disconnected
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1 className="admin-page__title">Google Calendar</h1>
        <p className="lede">
          Connect your Google account so meetings created in Captor appear on
          your calendar with a Google Meet link, and booked slots respect your
          existing busy times.
        </p>
      </header>

      {sp?.status === "connected" && (
        <div className="admin-toast admin-toast--success">
          Google account connected.
        </div>
      )}
      {sp?.status === "error" && (
        <div className="admin-toast admin-toast--warn">
          Could not connect: {sp.reason ?? "unknown error"}
        </div>
      )}

      <GoogleConnectClient
        connected={status.connected}
        email={status.email}
        expiresAt={status.expires_at}
      />
    </div>
  );
}
