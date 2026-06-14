import LegalPage from "@/components/LegalPage";

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      description="Cette page regroupe les informations légales de Mémoire Vivante. Elle devra être complétée avec les informations officielles de l’éditeur avant la mise en production."
      sections={[
        {
          title: "Éditeur du site",
          text: "Mémoire Vivante est un projet de service en ligne dédié à la restauration de photos anciennes et à la création d’albums souvenirs. Les coordonnées complètes de l’éditeur seront ajoutées avant publication.",
        },
        {
          title: "Hébergement",
          text: "Les informations relatives à l’hébergement du site et aux prestataires techniques seront précisées avant la mise en ligne publique.",
        },
        {
          title: "Contact",
          text: "Une adresse de contact dédiée au support et aux demandes légales sera ajoutée avant le lancement commercial.",
        },
      ]}
    />
  );
}
