/**
 * RestoPanel · Mock data — Google reviews (8)
 * Real Spanish copy, no lorem ipsum.
 */

export type ReviewSentiment = "positive" | "neutral" | "negative";
export type ReviewTopic = "food" | "service" | "price" | "ambiance";

export interface MockReview {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string; // ISO date
  sentiment: ReviewSentiment;
  topics: ReviewTopic[];
}

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: "RV-01",
    author: "Marta R.",
    rating: 5,
    text:
      "Sin duda el mejor restaurante de cocina de mercado de Madrid. El trato de Carmen en sala fue excepcional y el tartar de atún rojo estaba perfecto. Repetiremos seguro.",
    date: "2025-11-18",
    sentiment: "positive",
    topics: ["food", "service"],
  },
  {
    id: "RV-02",
    author: "Javier S.",
    rating: 5,
    text:
      "Reservamos por Google y nos confirmaron al instante por WhatsApp. La terraza es espectacular al atardecer. Precio justo para la calidad que ofrecen.",
    date: "2025-11-15",
    sentiment: "positive",
    topics: ["service", "ambiance", "price"],
  },
  {
    id: "RV-03",
    author: "Lucía F.",
    rating: 4,
    text:
      "La comida muy buena, aunque tardaron un poco en servir el segundo plato. El ambiente es agradable y el personal muy atento. Volveré por la carta de vinos.",
    date: "2025-11-12",
    sentiment: "positive",
    topics: ["food", "service", "ambiance"],
  },
  {
    id: "RV-04",
    author: "Andrés P.",
    rating: 3,
    text:
      "El sitio está bien pero el precio me pareció algo elevado para el menú del mediodía. El servicio correcto, sin más. Quizá pruebe la cena otra vez.",
    date: "2025-11-09",
    sentiment: "neutral",
    topics: ["price", "service"],
  },
  {
    id: "RV-05",
    author: "Carmen V.",
    rating: 5,
    text:
      "Llevamos años viniendo y nunca defrauda. Avisé de mi alergia a marisco y me prepararon un menú degustación alternativo increíble. Servicio 10.",
    date: "2025-11-05",
    sentiment: "positive",
    topics: ["food", "service"],
  },
  {
    id: "RV-06",
    author: "Diego M.",
    rating: 2,
    text:
      "Reservamos para 8 y nos asignaron una mesa pequeña. Tuvimos que esperar 20 minutos de más pese a tener reserva. La comida bien, pero la organización floja.",
    date: "2025-11-02",
    sentiment: "negative",
    topics: ["service", "ambiance"],
  },
  {
    id: "RV-07",
    author: "Nuria C.",
    rating: 5,
    text:
      "Celebré mi cumpleaños y nos sorprendieron con un postre de cortesía. Atención al detalle impresionante, me sentí súper cuidada. Lo recomiendo totalmente.",
    date: "2025-10-28",
    sentiment: "positive",
    topics: ["food", "service", "ambiance"],
  },
  {
    id: "RV-08",
    author: "Pablo H.",
    rating: 4,
    text:
      "Ambiente muy cuidado y carta interesante. El rabo de toro estupendo. Bajó un punto porque el parking cercano es complicado, pero el restaurante lo merece.",
    date: "2025-10-22",
    sentiment: "positive",
    topics: ["food", "ambiance"],
  },
];
