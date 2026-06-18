export function formatDobInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join("-");
}

export function getDobParts(value: string) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return null;

  return {
    day: Number(match[1]),
    month: Number(match[2]),
    year: Number(match[3]),
  };
}

export function dobToIsoDate(value: string) {
  const parts = getDobParts(value);
  if (!parts) return "";

  return [
    String(parts.year).padStart(4, "0"),
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

export function isValidDob(value: string) {
  const parts = getDobParts(value);
  if (!parts) return false;

  const date = new Date(parts.year, parts.month - 1, parts.day);
  const today = new Date();

  return (
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day &&
    date <= today
  );
}

export function getAgeFromDob(value: string) {
  if (!isValidDob(value)) return null;

  const parts = getDobParts(value);
  if (!parts) return null;

  const today = new Date();
  let age = today.getFullYear() - parts.year;
  const birthdayThisYear = new Date(today.getFullYear(), parts.month - 1, parts.day);

  if (today < birthdayThisYear) {
    age -= 1;
  }

  return age;
}
