/** Latence simulée des services de démonstration (affiche les états de chargement). */
export function mockDelay(min = 450, max = 950): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))
}
