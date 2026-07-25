/**
 * RestoPanel · Mock data — Demo restaurant profile
 * Plain TS module (no "use client"); safe to import anywhere.
 */

export interface RestaurantProfile {
  name: string;
  type: string;
  city: string;
  capacity: number;
  tables: number;
  avgTicket: number;
  googleRating: number;
  reviewCount: number;
}

export const RESTAURANT: RestaurantProfile = {
  name: "Casa Marena",
  type: "Cocina de mercado",
  city: "Madrid",
  capacity: 82,
  tables: 24,
  avgTicket: 48,
  googleRating: 4.9,
  reviewCount: 1247,
};
