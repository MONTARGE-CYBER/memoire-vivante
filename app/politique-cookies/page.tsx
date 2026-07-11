import LegalPage from "@/components/LegalPage";

export default function PolitiqueCookiesPage() {
  return (
    <LegalPage
      title="Politique relative aux cookies"
      description="Cette page présente l’usage des cookies et mécanismes de stockage utilisés par Mémoire Vivante."
      sections={[
        {
          title: "Cookies nécessaires",
          text: "Certains cookies ou mécanismes de stockage peuvent être nécessaires à la connexion, à la sécurité et au bon fonctionnement du compte utilisateur.",
        },
        {
          title: "Mesure d’audience",
          text: "Si une mesure d’audience est utilisée, elle sert à comprendre l’utilisation générale du service et à améliorer l’expérience utilisateur.",
        },
        {
          title: "Gestion du consentement",
          text: "Lorsque des cookies non essentiels sont utilisés, un mécanisme de consentement permet à l’utilisateur de gérer ses préférences.",
        },
      ]}
    />
  );
}
