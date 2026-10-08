/** Round up to a readable axis max with ~10% headroom */
export function getNiceDomainMax(value: number, padding = 1.1) {
  if (value <= 0) return 5
  const padded = value * padding
  const magnitude = 10 ** Math.floor(Math.log10(padded))
  const normalized = padded / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

export function getTicks(max: number, count = 4) {
  return Array.from({ length: count + 1 }, (_, i) => (max / count) * i)
}
