export function normalizeSalinity(value, unit = 'sg') {
  const num = parseFloat(value);
  if (isNaN(num)) return 1.025;
  if (unit.toLowerCase() === 'ppt') {
    return Number((1.0 + num * 0.0008).toFixed(4));
  }
  return Number(num.toFixed(4));
}

export function normalizeAlkalinity(value, unit = 'dkh') {
  const num = parseFloat(value);
  if (isNaN(num)) return 8.4;
  const u = unit.toLowerCase();
  if (u === 'meq_l' || u === 'meq/l') {
    return Number((num * 2.804).toFixed(2));
  }
  if (u === 'ppm') {
    return Number((num / 17.86).toFixed(2));
  }
  return Number(num.toFixed(2));
}

export function normalizeTemperature(value, unit = 'c') {
  const num = parseFloat(value);
  if (isNaN(num)) return 25.0;
  if (unit.toLowerCase() === 'f') {
    return Number(((num - 32.0) / 1.8).toFixed(2));
  }
  return Number(num.toFixed(2));
}
