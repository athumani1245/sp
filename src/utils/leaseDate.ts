import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const LEASE_DATE_FORMATS = ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'YYYY/MM/DD'];

export const parseLeaseDate = (value?: string | null): Dayjs | null => {
  if (!value) return null;

  const normalizedValue = String(value).trim();
  const parsedDate = dayjs(normalizedValue, LEASE_DATE_FORMATS, true);

  if (parsedDate.isValid()) {
    return parsedDate;
  }

  const fallbackDate = dayjs(normalizedValue);
  return fallbackDate.isValid() ? fallbackDate : null;
};

export const formatLeaseDate = (
  value?: string | null,
  outputFormat: string = 'DD/MM/YYYY'
): string => {
  const parsedDate = parseLeaseDate(value);
  return parsedDate ? parsedDate.format(outputFormat) : '';
};
