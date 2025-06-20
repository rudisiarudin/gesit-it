export function getDuration(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const diff = Math.abs(end.getTime() - start.getTime());

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  return hours > 0 ? `${hours}h ${remainMinutes}m` : `${remainMinutes}m`;
}
