import LegalPage from "@/components/LegalPage";

export default function ConditionsUtilisationPage() {
  return (
    <LegalPage
      title="Conditions d'utilisation"
      description="Ces conditions présentent les règles générales d’utilisation de Mémoire Vivante. Elles devront être finalisées avant l’ouverture commerciale."
      sections={[
        {
          title: "Objet du service",
          text: "Mémoire Vivante permet d’importer des photos anciennes, de les restaurer avec l’aide de l’intelligence artificielle et de les organiser dans une galerie privée.",
        },
        {
          title: "Responsabilité de l’utilisateur",
          text: "L’utilisateur doit disposer des droits nécessaires sur les photos importées et s’engage à ne pas téléverser de contenu illicite ou portant atteinte aux droits de tiers.",
        },
        {
          title: "Évolutions du service",
          text: "Certaines fonctionnalités, comme les exports imprimables ou les téléchargements sans filigrane via crédits, peuvent évoluer au fil du développement.",
        },
      ]}
    />
  );
}
