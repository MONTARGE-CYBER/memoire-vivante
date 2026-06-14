import LegalPage from "@/components/LegalPage";

export default function PolitiqueCookiesPage() {
  return (
    <LegalPage
      title="Politique relative aux cookies"
      description="Cette page présente l’usage prévu des cookies et traceurs. Elle devra être ajustée selon les outils réellement activés sur le site."
      sections={[
        {
          title: "Cookies nécessaires",
          text: "Certains cookies ou mécanismes de stockage peuvent être nécessaires à la connexion, à la sécurité et au bon fonctionnement du compte utilisateur.",
        },
        {
          title: "Mesure d’audience",
          text: "Si un outil de mesure d’audience est ajouté, ses finalités et ses paramètres de consentement seront détaillés ici.",
        },
        {
          title: "Gestion du consentement",
          text: "Un mécanisme de gestion du consentement pourra être ajouté avant la mise en production si des cookies non essentiels sont utilisés.",
        },
      ]}
    />
  );
}
