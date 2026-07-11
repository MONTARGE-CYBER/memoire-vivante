import LegalPage from "@/components/LegalPage";

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      description="Cette politique explique les grands principes de traitement des données sur Mémoire Vivante."
      sections={[
        {
          title: "Données collectées",
          text: "Mémoire Vivante peut collecter l’adresse e-mail du compte, les photos importées, les photos restaurées et les informations nécessaires au fonctionnement du service.",
        },
        {
          title: "Utilisation des données",
          text: "Les données sont utilisées pour permettre la restauration des photos, l’accès à la galerie privée, la création d’exports album ou calendrier et la gestion du compte utilisateur.",
        },
        {
          title: "Suppression",
          text: "L’utilisateur peut supprimer ses restaurations depuis sa galerie. Certaines données techniques peuvent être conservées temporairement lorsque cela est nécessaire au fonctionnement, à la sécurité ou aux obligations légales du service.",
        },
      ]}
    />
  );
}
