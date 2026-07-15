// Чистий движок розрахунку ОРІЄНТОВНОЇ ціни (не рахунок, оплат на сайті немає).
// Без БД і server-only — використовується і на клієнті, і на сервері.

export type PricingRates = {
  currency?: string;
  baseRate: number;
  perMileRate: number;
  perHourRate: number;
  minimumCharge: number;
  helperRate?: number | null;
  floorSurcharge?: number | null;
  noLiftSurcharge?: number | null;
  heavyItemSurcharge?: number | null;
  bulkyItemSurcharge?: number | null;
  packingSurcharge?: number | null;
  assemblySurcharge?: number | null;
  urgencySurcharge?: number | null;
  sameDaySurcharge?: number | null;
  eveningNightSurcharge?: number | null;
  weekendHolidaySurcharge?: number | null;
  internationalBase?: number | null;
  tollsFlat?: number | null;
  parkingFlat?: number | null;
  extraStopRate?: number | null;
};

export type PricingInput = {
  distanceMiles: number;
  numberOfHelpers?: number;
  pickupFloor?: number;
  deliveryFloor?: number;
  liftAvailable?: boolean;
  heavyItems?: number;
  bulkyItems?: number;
  packing?: boolean;
  assembly?: boolean;
  sameDay?: boolean;
  urgent?: boolean;
  eveningNight?: boolean;
  weekendHoliday?: boolean;
  international?: boolean;
  extraStops?: number;
};

export type PriceLine = { label: string; amount: number };
export type PriceBreakdown = {
  currency: string;
  lines: PriceLine[];
  subtotal: number;
  minimumApplied: boolean;
  total: number;
  distanceMiles: number;
  estimatedHours: number;
};

function n(v: number | null | undefined): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

/** Груба оцінка тривалості: дорога (30 миль/год) + база завантаження. */
function estimateHours(distanceMiles: number, helpers: number): number {
  const travel = distanceMiles / 30;
  const handling = 1 + helpers * 0.25;
  return Math.round((travel + handling) * 10) / 10;
}

export function computeEstimate(input: PricingInput, rates: PricingRates): PriceBreakdown {
  const currency = rates.currency ?? "GBP";
  const helpers = n(input.numberOfHelpers);
  const hours = estimateHours(input.distanceMiles, helpers);
  const billableFloors = input.liftAvailable ? 0 : n(input.pickupFloor) + n(input.deliveryFloor);

  const lines: PriceLine[] = [];
  const add = (label: string, amount: number) => {
    if (amount > 0) lines.push({ label, amount: Math.round(amount * 100) / 100 });
  };

  add("Base rate", n(rates.baseRate));
  add(`Distance (${input.distanceMiles} mi)`, n(rates.perMileRate) * input.distanceMiles);
  add(`Time (~${hours} h)`, n(rates.perHourRate) * hours);
  if (helpers) add(`Helpers × ${helpers}`, n(rates.helperRate) * helpers);
  if (billableFloors) add(`Floors × ${billableFloors} (no lift)`, n(rates.floorSurcharge) * billableFloors);
  if (billableFloors && !input.liftAvailable) add("No lift surcharge", n(rates.noLiftSurcharge));
  if (input.heavyItems) add(`Heavy items × ${input.heavyItems}`, n(rates.heavyItemSurcharge) * input.heavyItems);
  if (input.bulkyItems) add(`Bulky items × ${input.bulkyItems}`, n(rates.bulkyItemSurcharge) * input.bulkyItems);
  if (input.packing) add("Packing service", n(rates.packingSurcharge));
  if (input.assembly) add("Assembly / dismantling", n(rates.assemblySurcharge));
  if (input.extraStops) add(`Extra stops × ${input.extraStops}`, n(rates.extraStopRate) * input.extraStops);
  if (input.sameDay) add("Same-day", n(rates.sameDaySurcharge));
  if (input.urgent) add("Urgency", n(rates.urgencySurcharge));
  if (input.eveningNight) add("Evening / night", n(rates.eveningNightSurcharge));
  if (input.weekendHoliday) add("Weekend / holiday", n(rates.weekendHolidaySurcharge));
  if (input.international) {
    add("International base", n(rates.internationalBase));
    add("Tolls", n(rates.tollsFlat));
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.amount, 0) * 100) / 100;
  const minimumApplied = subtotal < n(rates.minimumCharge);
  const total = minimumApplied ? n(rates.minimumCharge) : subtotal;

  return {
    currency,
    lines,
    subtotal,
    minimumApplied,
    total: Math.round(total * 100) / 100,
    distanceMiles: input.distanceMiles,
    estimatedHours: hours,
  };
}
