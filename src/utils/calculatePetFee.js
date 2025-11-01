export function calculatePetFee(nights, numPets = 0) {
  const n = Math.max(0, Math.floor(Number(nights) || 0));
  const pets = Math.max(0, Number(numPets) || 0);
  if (pets === 0) return 0;
  if (pets > 2) return NaN; // caller should handle validation error
  const cycles = Math.floor(n / 30);
  const rem = n % 30;
  let remFee = 0;
  if (rem === 1) remFee = 25;
  else if (rem === 2) remFee = 50;
  else if (rem === 3) remFee = 75;
  else if (rem >= 4) remFee = 100;
  return cycles * 100 + remFee;
}

export default calculatePetFee;
