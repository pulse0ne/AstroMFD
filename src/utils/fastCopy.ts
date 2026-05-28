export function fastCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}
