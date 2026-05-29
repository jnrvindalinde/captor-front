"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  title?: string;
  downloadUrl?: string;
  downloadName?: string;
};

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, downloadUrl, downloadName }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => {
      setDuration(a.duration || 0);
      setReady(true);
    };
    const onTime = () => setCurrentTime(a.currentTime);
    const onProgress = () => {
      if (a.buffered.length > 0) {
        setBuffered(a.buffered.end(a.buffered.length - 1));
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onVolume = () => {
      setVolume(a.volume);
      setMuted(a.muted);
    };
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("progress", onProgress);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("volumechange", onVolume);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("progress", onProgress);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("volumechange", onVolume);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }, []);

  const skip = useCallback((delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min((a.duration || 0), a.currentTime + delta));
  }, []);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const v = Number(e.target.value);
    a.currentTime = v;
    setCurrentTime(v);
  };

  const onVolumeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const v = Number(e.target.value);
    a.volume = v;
    if (v > 0 && a.muted) a.muted = false;
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
  };

  const cycleSpeed = () => {
    const a = audioRef.current;
    if (!a) return;
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    a.playbackRate = SPEEDS[next];
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufPct = duration > 0 ? Math.min(100, (buffered / duration) * 100) : 0;

  return (
    <div className="audio-player" role="region" aria-label={title ? `Audio player for ${title}` : "Audio player"}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="audio-player__main">
        <button
          type="button"
          className="audio-player__btn audio-player__btn--skip"
          onClick={() => skip(-15)}
          aria-label="Rewind 15 seconds"
          disabled={!ready}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="currentColor" d="M12 5V2L7 6l5 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">15</text>
          </svg>
        </button>

        <button
          type="button"
          className="audio-player__btn audio-player__btn--play"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          disabled={!ready}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path fill="currentColor" d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="audio-player__btn audio-player__btn--skip"
          onClick={() => skip(15)}
          aria-label="Forward 15 seconds"
          disabled={!ready}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="currentColor" d="M12 5V2L7 6l5 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="scale(-1 1) translate(-24 0)" />
            <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">15</text>
          </svg>
        </button>

        <div className="audio-player__seek">
          <div className="audio-player__time audio-player__time--current">{formatTime(currentTime)}</div>
          <div
            className="audio-player__track"
            style={{
              ["--audio-progress" as string]: `${pct}%`,
              ["--audio-buffered" as string]: `${bufPct}%`,
            }}
          >
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={onSeek}
              aria-label="Seek"
              disabled={!ready}
            />
          </div>
          <div className="audio-player__time audio-player__time--total">{formatTime(duration)}</div>
        </div>
      </div>

      <div className="audio-player__controls">
        <button
          type="button"
          className="audio-player__chip"
          onClick={cycleSpeed}
          aria-label={`Playback speed ${SPEEDS[speedIdx]}x`}
          title="Playback speed"
        >
          {SPEEDS[speedIdx]}×
        </button>

        <div className="audio-player__volume">
          <button
            type="button"
            className="audio-player__btn audio-player__btn--mini"
            onClick={toggleMute}
            aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.17v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume > 0.5 ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d="M7 9v6h4l5 5V4l-5 5H7zm9.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={onVolumeInput}
            aria-label="Volume"
            className="audio-player__volume-slider"
            style={{ ["--audio-volume" as string]: `${(muted ? 0 : volume) * 100}%` }}
          />
        </div>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadName || true}
            className="audio-player__chip audio-player__chip--link"
            aria-label="Download audio"
            title="Download"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
            </svg>
            <span>Download</span>
          </a>
        )}
      </div>
    </div>
  );
}
