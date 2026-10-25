export type QRPayload = {
  v: 1;
  event: string;
  title?: string;
  start?: string;
  end?: string;
};

const ATTENDANCE_WEB_URL = process.env.EXPO_PUBLIC_ATTENDANCE_WEB_URL?.trim();

export function isBrowserCheckInConfigured(): boolean {
  return Boolean(
    ATTENDANCE_WEB_URL &&
      /^https:\/\//i.test(ATTENDANCE_WEB_URL) &&
      !ATTENDANCE_WEB_URL.includes('your-site')
  );
}

/**
 * When a public web URL is configured, encode a link that a phone camera can
 * open. Until then, retain the legacy JSON payload so existing in-app scanning
 * continues to work during setup.
 */
export function buildQRPayload(event: {
  eventId: string;
  title: string;
  start?: string;
  end?: string;
}): string {
  if (isBrowserCheckInConfigured()) {
    const base = ATTENDANCE_WEB_URL!.replace(/\/+$/, '');
    return `${base}/attend?event=${encodeURIComponent(event.eventId)}`;
  }

  const payload: QRPayload = {
    v: 1,
    event: event.eventId,
  };

  if (event.title) payload.title = event.title;
  if (event.start) payload.start = event.start;
  if (event.end) payload.end = event.end;

  return JSON.stringify(payload);
}

export type ParseQRResult =
  | { ok: true; payload: QRPayload }
  | { ok: false; message: string };

export function parseQRPayload(raw: string): ParseQRResult {
  // Accept the browser link as well as legacy JSON QR payloads. This keeps the
  // app's built-in camera compatible with newly generated QR codes.
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const event = url.searchParams.get('event');
      if (
        url.pathname.replace(/\/$/, '').endsWith('/attend') &&
        event &&
        event.length <= 64 &&
        !/[\u0000-\u001f]/.test(event)
      ) {
        return { ok: true, payload: { v: 1, event } };
      }
      return { ok: false, message: 'Not an attendance QR code.' };
    } catch {
      return { ok: false, message: 'Invalid QR code.' };
    }
  }

  let parsed: any;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, message: 'Invalid QR code.' };
  }

  if (
    parsed?.v !== 1 ||
    typeof parsed.event !== 'string' ||
    !parsed.event
  ) {
    return {
      ok: false,
      message: 'Not an attendance QR code.',
    };
  }

  return {
    ok: true,
    payload: parsed as QRPayload,
  };
}
