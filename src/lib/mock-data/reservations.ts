/**
 * RestoPanel · Mock data — Today's reservations (~20)
 * Times are 24h strings for easy formatting.
 */

export type ReservationStatus =
  | "confirmed"
  | "pending"
  | "seated"
  | "completed";

export type ReservationChannel =
  | "web"
  | "google"
  | "whatsapp"
  | "phone";

export interface MockReservation {
  id: string;
  customerName: string;
  phone: string;
  partySize: number;
  time: string; // "HH:MM"
  tableId: string;
  zone: "sala" | "terraza";
  status: ReservationStatus;
  channel: ReservationChannel;
  vip: boolean;
}

export const MOCK_RESERVATIONS: MockReservation[] = [
  { id: "R-2401", customerName: "Marta Ruiz",       phone: "+34 611 223 314", partySize: 2, time: "13:00", tableId: "T01", zone: "sala",    status: "completed", channel: "web",      vip: true  },
  { id: "R-2402", customerName: "Javier Soto",      phone: "+34 622 880 110", partySize: 4, time: "13:15", tableId: "T03", zone: "sala",    status: "completed", channel: "google",   vip: false },
  { id: "R-2403", customerName: "Lucía Ferrer",      phone: "+34 633 441 552", partySize: 6, time: "13:30", tableId: "T05", zone: "sala",    status: "completed", channel: "whatsapp", vip: false },
  { id: "R-2404", customerName: "Andrés Pardo",      phone: "+34 644 552 998", partySize: 2, time: "14:00", tableId: "T08", zone: "sala",    status: "completed", channel: "phone",    vip: false },
  { id: "R-2405", customerName: "Carmen Velasco",     phone: "+34 655 220 117", partySize: 4, time: "14:15", tableId: "T17", zone: "terraza", status: "completed", channel: "web",      vip: true  },
  { id: "R-2406", customerName: "Diego Marín",        phone: "+34 666 110 882", partySize: 8, time: "14:30", tableId: "T07", zone: "sala",    status: "completed", channel: "google",   vip: false },
  { id: "R-2407", customerName: "Nuria Cano",         phone: "+34 677 332 110", partySize: 2, time: "20:00", tableId: "T02", zone: "sala",    status: "seated",    channel: "web",      vip: false },
  { id: "R-2408", customerName: "Pablo Hidalgo",      phone: "+34 688 443 220", partySize: 4, time: "20:15", tableId: "T04", zone: "sala",    status: "seated",    channel: "whatsapp", vip: true  },
  { id: "R-2409", customerName: "Sofía Montero",      phone: "+34 699 554 003", partySize: 6, time: "20:30", tableId: "T06", zone: "sala",    status: "confirmed", channel: "web",      vip: false },
  { id: "R-2410", customerName: "Mateo Rivas",        phone: "+34 610 665 224", partySize: 2, time: "20:45", tableId: "T15", zone: "terraza", status: "confirmed", channel: "google",   vip: false },
  { id: "R-2411", customerName: "Elena Carrasco",     phone: "+34 621 776 008", partySize: 4, time: "21:00", tableId: "T10", zone: "sala",    status: "confirmed", channel: "whatsapp", vip: true  },
  { id: "R-2412", customerName: "Hugo Bermúdez",      phone: "+34 632 887 559", partySize: 2, time: "21:15", tableId: "T16", zone: "terraza", status: "confirmed", channel: "web",      vip: false },
  { id: "R-2413", customerName: "Paula Iglesias",     phone: "+34 643 998 110", partySize: 6, time: "21:30", tableId: "T19", zone: "terraza", status: "pending",   channel: "google",   vip: false },
  { id: "R-2414", customerName: "Iván Delgado",       phone: "+34 654 109 220", partySize: 4, time: "21:45", tableId: "T18", zone: "terraza", status: "pending",   channel: "phone",    vip: false },
  { id: "R-2415", customerName: "Laura Mendoza",     phone: "+34 665 210 998", partySize: 2, time: "22:00", tableId: "T11", zone: "sala",    status: "pending",   channel: "web",      vip: false },
  { id: "R-2416", customerName: "Sergio Bravo",       phone: "+34 676 321 553", partySize: 8, time: "22:15", tableId: "T24", zone: "terraza", status: "confirmed", channel: "whatsapp", vip: true  },
  { id: "R-2417", customerName: "Celia Navarro",      phone: "+34 687 432 007", partySize: 4, time: "22:30", tableId: "T13", zone: "sala",    status: "confirmed", channel: "google",   vip: false },
  { id: "R-2418", customerName: "Adrián Lozano",      phone: "+34 698 543 882", partySize: 2, time: "22:45", tableId: "T21", zone: "terraza", status: "pending",   channel: "web",      vip: false },
  { id: "R-2419", customerName: "Beatriz Ortega",    phone: "+34 609 654 110", partySize: 6, time: "23:00", tableId: "T20", zone: "terraza", status: "confirmed", channel: "phone",    vip: false },
  { id: "R-2420", customerName: "Marcos Peña",        phone: "+34 612 765 998", partySize: 4, time: "23:15", tableId: "T14", zone: "sala",    status: "pending",   channel: "google",   vip: false },
];
