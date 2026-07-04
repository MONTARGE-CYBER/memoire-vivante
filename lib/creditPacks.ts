export type CreditPackId = "discovery" | "family" | "memory";

export type CreditPack = {
  credits: number;
  description: string;
  featured?: boolean;
  id: CreditPackId;
  name: string;
  price: string;
  priceCents: number;
};

export const creditPacks: CreditPack[] = [
  {
    credits: 5,
    description: "Pour tester le rendu ou créer un calendrier annuel simple.",
    id: "discovery",
    name: "Découverte",
    price: "5,90€",
    priceCents: 590,
  },
  {
    credits: 25,
    description:
      "Pour préparer un album carré de 24 pages avec une vraie sélection familiale.",
    featured: true,
    id: "family",
    name: "Album famille",
    price: "19,90€",
    priceCents: 1990,
  },
  {
    credits: 60,
    description:
      "Pour restaurer une collection plus complète avant album, calendrier ou archive familiale.",
    id: "memory",
    name: "Grande mémoire",
    price: "39,90€",
    priceCents: 3990,
  },
];

export function getCreditPack(packId: string) {
  return creditPacks.find((pack) => pack.id === packId);
}
