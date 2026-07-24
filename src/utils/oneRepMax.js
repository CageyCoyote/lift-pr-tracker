// Estimated 1-rep max from a logged weight × reps set.
// Returns null when an estimate isn't meaningful (bodyweight sets, or an
// actual 1-rep set — the "estimate" would just be the weight itself).
export function estimateOneRepMax(weight, reps, unit) {
  if (unit === 'bodyweight') return null
  if (!weight || !reps || reps <= 1) return null

  let oneRm
  if (reps <= 8) {
    // Brzycki — most accurate in the low-rep range
    oneRm = weight / (1.0278 - 0.0278 * reps)
  } else if (reps <= 12) {
    // Epley
    oneRm = weight * (1 + reps / 30)
  } else {
    // O'Conner — less accurate at high reps, but a reasonable ballpark
    oneRm = weight * (1 + 0.025 * reps)
  }

  return Math.round(oneRm)
}
