"use client";

import { useState, useTransition } from "react";
import { disconnectGoogleAction, getGoogleConnectUrlAction } from "./_actions";

type Props = {
  connected: boolean;
  email: string | null;
  expiresAt: string | null;
};

export function GoogleConnectClient({ connected, email, expiresAt }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    setError(null);
    start(async () => {
      const res = await getGoogleConnectUrlAction();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      window.location.href = res.authUrl;
    });
  };

  const handleDisconnect = () => {
    if (!window.confirm("Disconnect this Google account from Captor? Existing meetings keep their links but new bookings will not sync.")) {
      return;
    }
    setError(null);
    start(async () => {
      const res = await disconnectGoogleAction();
      if (!res.ok && res.error) setError(res.error);
      else window.location.reload();
    });
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel__body admin-google-status">
        {connected ? (
          <div className="admin-google-status__inner">
            <div className="admin-google-status__row">
              <span className="admin-google-status__dot admin-google-status__dot--ok" aria-hidden />
              <div>
                <strong>Connected</strong>
                {email && <div className="admin-muted">{email}</div>}
                {expiresAt && (
                  <div className="admin-muted admin-muted--sm">
                    Access token expires {new Date(expiresAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleDisconnect}
              disabled={pending}
            >
              {pending ? "Working…" : "Disconnect"}
            </button>
          </div>
        ) : (
          <div className="admin-google-status__inner">
            <div className="admin-google-status__row">
              <span className="admin-google-status__dot" aria-hidden />
              <div>
                <strong>Not connected</strong>
                <div className="admin-muted">
                  Captor needs permission to create and update calendar events
                  on your behalf.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleConnect}
              disabled={pending}
            >
              {pending ? "Opening Google…" : "Connect Google"}
            </button>
          </div>
        )}

        {error && (
          <div className="admin-toast admin-toast--warn" style={{ marginTop: 16 }}>
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
