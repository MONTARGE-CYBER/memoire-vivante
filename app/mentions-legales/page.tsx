import LegalPage from "@/components/LegalPage";

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      description="Cette page regroupe les informations légales de Mémoire Vivante."
      sections={[
        {
          title: "Éditeur du site",
          text: "Mémoire Vivante est un service en ligne dédié à la restauration de photos anciennes et à la création d’albums souvenirs. Les informations complètes de l’éditeur sont indiquées sur cette page ou communiquées sur demande.",
        },
        {
          title: "Hébergement",
          text: "Le site est hébergé par des prestataires techniques spécialisés dans l’hébergement d’applications web et le stockage sécurisé des données.",
        },
        {
          title: "Contact",
          text: "Pour toute question liée au service, au support ou aux demandes légales, l’utilisateur peut utiliser les coordonnées de contact mises à disposition par Mémoire Vivante.",
        },
      ]}
    />
  );
}
