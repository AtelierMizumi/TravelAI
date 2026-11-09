/**
 * Adds the picked image to a multipart body as a real Blob/File on every platform.
 * Expo's fetch rejects React Native's legacy `{ uri, name, type }` part with
 * "Unsupported FormDataPart implementation", so the file is read through fetch first.
 */
export async function appendImagePart(
  body: FormData,
  uri: string,
  signal: AbortSignal,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const image = await fetchImpl(uri, { signal });
  body.append("file", await image.blob(), "recognition.jpg");
}
