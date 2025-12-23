export const formatRunning = (r: boolean | null | undefined) =>
  r === true ? 'Running' : r === false ? 'Scheduled' : '';

export const formatDate = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleString() : 'N/A';
