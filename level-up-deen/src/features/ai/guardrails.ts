const bannedClaims = [
  "fatwa final",
  "jaminan pahala",
  "menilai kualitas ibadah",
];

export function validateAIResponse(text: string) {
  const lowered = text.toLowerCase();
  const blocked = bannedClaims.some((word) => lowered.includes(word));

  return {
    safe: !blocked,
    reason: blocked ? "Response melanggar guardrail AI" : "ok",
  };
}
