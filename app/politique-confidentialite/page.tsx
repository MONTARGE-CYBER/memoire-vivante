import LegalPage from "@/components/LegalPage";

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      description="Cette politique explique les grands principes de traitement des données. Elle devra être relue et complétée avant le lancement public."
      sections={[
        {
          title: "Données collectées",
          text: "Mémoire Vivante peut collecter l’adresse e-mail du compte, les photos importées, les photos restaurées et les informations nécessaires au fonctionnement du service.",
        },
        {
          title: "Utilisation des données",
          text: "Les données sont utilisées pour permettre la restauration des photos, l’accès à la galerie privée, le téléchargement des fichiers et la gestion du compte utilisateur.",
        },
        {
          title: "Suppression",
          text: "L’utilisateur peut supprimer ses restaurations depuis sa galerie. Les modalités complètes de suppression et de conservation seront précisées avant mise en production.",
        },
      ]}
    />
  );
}
