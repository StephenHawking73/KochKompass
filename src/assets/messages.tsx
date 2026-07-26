export type DevelopmentMessage = {
  title: string;
  message: string;
};


export const devMessages = {

  general: [
    {
      title: "Der Koala tüftelt noch 🐨",
      message:
        "Dieses Feature bekommt gerade den letzten Schliff. Bald kannst du es ausprobieren!",
    },
    {
      title: "Noch kurz im Ofen 🔥",
      message:
        "Wir backen gerade die letzten Details fertig. Schau bald wieder vorbei!",
    },
    {
      title: "Frisch aus der Entwicklungsküche 👨‍🍳",
      message:
        "Hier entsteht gerade etwas Leckeres. Es dauert nur noch ein kleines bisschen.",
    },
  ],


  auth: [
    {
      title: "Der Koala sucht noch den Schlüssel 🔑",
      message:
        "Diese Anmeldung wird gerade vorbereitet. Bis dahin kannst du dich mit deiner E-Mail anmelden.",
    },
    {
      title: "Fast eingeloggt 🐨",
      message:
        "Unser kleiner Koala richtet diese Funktion noch für dich ein. Probiers doch erst Mal mit deiner E-Mail.",
    },
  ],


  statistics: [
    {
      title: "Der Koala zählt noch 📊",
      message:
        "Wir sammeln noch die letzten Zutaten für deine persönlichen Statistiken.",
    },
    {
      title: "Deine Kochreise entsteht ✨",
      message:
        "Bald kannst du hier deine Fortschritte und Lieblingsgerichte sehen.",
    },
  ],


  ai: [
    {
      title: "Der Koch-Koala denkt nach 🤖",
      message:
        "Unsere kleine Küchen-KI lernt noch ein paar Rezepte kennen.",
    },
    {
      title: "Die KI-Küche wird vorbereitet 🧠",
      message:
        "Wir würzen gerade die letzten Details dieser Funktion.",
    },
  ],


  shopping: [
    {
      title: "Die Einkaufstasche wird gepackt 🛒",
      message:
        "Wir bereiten gerade deine digitale Einkaufsliste vor.",
    },
    {
      title: "Noch ein paar Zutaten fehlen 🥕",
      message:
        "Dieses Feature bekommt gerade die letzten wichtigen Zutaten.",
    },
  ],


  recipes: [
    {
      title: "Das Rezept wird verfeinert 🍝",
      message:
        "Wir geben diesem Bereich noch den letzten Geschmack.",
    },
    {
      title: "Die Rezeptküche arbeitet 🥄",
      message:
        "Der Koala probiert gerade noch die letzten Verbesserungen aus.",
    },
  ],


} satisfies Record<string, DevelopmentMessage[]>;

export function getDevelopmentMessage(
  category: keyof typeof devMessages
) {
  const messages = devMessages[category];

  return messages[
    Math.floor(Math.random() * messages.length)
  ];
}