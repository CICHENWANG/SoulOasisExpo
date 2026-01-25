import Constants from 'expo-constants';

function getDevHost(): string | null {
  const anyConstants = Constants as unknown as {
    expoGoConfig?: { debuggerHost?: string };
    expoConfig?: { hostUri?: string };
    manifest?: { hostUri?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };

  const hostUri =
    anyConstants.expoGoConfig?.debuggerHost ??
    anyConstants.expoConfig?.hostUri ??
    anyConstants.manifest2?.extra?.expoClient?.hostUri ??
    anyConstants.manifest?.hostUri;

  if (!hostUri) return null;
  return hostUri.split(':')[0] ?? null;
}

export function resolveApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8080';

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }

  const host = url.hostname;
  if (host !== '127.0.0.1' && host !== 'localhost') {
    return raw;
  }

  const devHost = getDevHost();
  if (!devHost) {
    return raw;
  }

  if (devHost === '127.0.0.1' || devHost === 'localhost') {
    return raw;
  }

  url.hostname = devHost;
  return url.toString().replace(/\/$/, '');
}
