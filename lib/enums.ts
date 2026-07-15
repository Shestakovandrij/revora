// Значення «enum» зберігаються як String у БД (портативність SQLite/MySQL).
// Тут — єдине джерело істини + людські підписи для UI.

export const ROLES = ["CUSTOMER", "CARRIER", "ADMIN", "MODERATOR"] as const;
export type Role = (typeof ROLES)[number];

export const VERIFICATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "MORE_INFO_REQUIRED",
  "SUSPENDED",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const BUSINESS_TYPES = [
  "SOLE_TRADER",
  "LIMITED_COMPANY",
  "PARTNERSHIP",
  "OWNER_DRIVER",
  "REMOVAL_COMPANY",
  "COURIER_COMPANY",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const VEHICLE_TYPES = [
  "CAR",
  "VAN_SMALL",
  "VAN_MEDIUM",
  "VAN_LARGE",
  "LUTON",
  "TRUCK_7_5T",
  "TRUCK",
  "OTHER",
] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  CAR: "Car",
  VAN_SMALL: "Small Van",
  VAN_MEDIUM: "Medium Van",
  VAN_LARGE: "Large Van",
  LUTON: "Luton Van",
  TRUCK_7_5T: "7.5t Truck",
  TRUCK: "Truck",
  OTHER: "Other",
};

// Приблизний об'єм кузова за типом (м³) — для fallback-фільтра придатності.
export const VEHICLE_CAPACITY_M3: Record<VehicleType, number> = {
  CAR: 1,
  VAN_SMALL: 4,
  VAN_MEDIUM: 7,
  VAN_LARGE: 11,
  LUTON: 20,
  TRUCK_7_5T: 35,
  TRUCK: 50,
  OTHER: 15,
};

export const DOCUMENT_TYPES = [
  "DRIVING_LICENCE",
  "MOT",
  "MOTOR_INSURANCE",
  "GOODS_IN_TRANSIT",
  "PUBLIC_LIABILITY",
  "COMPANY_REGISTRATION",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  DRIVING_LICENCE: "Driving Licence",
  MOT: "MOT",
  MOTOR_INSURANCE: "Motor Insurance",
  GOODS_IN_TRANSIT: "Goods In Transit Insurance",
  PUBLIC_LIABILITY: "Public Liability Insurance",
  COMPANY_REGISTRATION: "Company Registration",
};

export const DOCUMENT_STATUSES = [
  "NOT_UPLOADED",
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
  "UPDATE_REQUIRED",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  NOT_UPLOADED: "Not uploaded",
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  UPDATE_REQUIRED: "Update required",
};

// Життєвий цикл замовлення (без кроку оплати).
export const ORDER_STATUSES = [
  "NEW",
  "INFO_REQUESTED",
  "DECLINED",
  "BOOKING_CONFIRMED",
  "SCHEDULED",
  "DRIVER_ON_THE_WAY",
  "ARRIVED",
  "LOADING",
  "IN_TRANSIT",
  "UNLOADING",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "New request",
  INFO_REQUESTED: "Info requested",
  DECLINED: "Declined",
  BOOKING_CONFIRMED: "Booking confirmed",
  SCHEDULED: "Scheduled",
  DRIVER_ON_THE_WAY: "Driver on the way",
  ARRIVED: "Arrived",
  LOADING: "Loading",
  IN_TRANSIT: "In transit",
  UNLOADING: "Unloading",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Дозволені переходи станів (сервер валідує).
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["BOOKING_CONFIRMED", "DECLINED", "INFO_REQUESTED", "CANCELLED"],
  INFO_REQUESTED: ["NEW", "BOOKING_CONFIRMED", "DECLINED", "CANCELLED"],
  DECLINED: [],
  BOOKING_CONFIRMED: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["DRIVER_ON_THE_WAY", "CANCELLED"],
  DRIVER_ON_THE_WAY: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["LOADING", "CANCELLED"],
  LOADING: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["UNLOADING", "CANCELLED"],
  UNLOADING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const SERVICE_TYPES: { code: string; name: string }[] = [
  { code: "HOUSE_REMOVALS", name: "House Removals" },
  { code: "FLAT_REMOVALS", name: "Flat Removals" },
  { code: "OFFICE_RELOCATIONS", name: "Office Relocations" },
  { code: "FURNITURE_DELIVERY", name: "Furniture Delivery" },
  { code: "SINGLE_ITEM_DELIVERY", name: "Single Item Delivery" },
  { code: "STUDENT_MOVES", name: "Student Moves" },
  { code: "STORAGE_COLLECTION", name: "Storage Collection & Delivery" },
  { code: "BUSINESS_DELIVERIES", name: "Business Deliveries" },
  { code: "SAME_DAY_DELIVERIES", name: "Same Day Deliveries" },
  { code: "LONG_DISTANCE_MOVES", name: "Long Distance Moves" },
  { code: "EUROPEAN_TRANSPORT", name: "European Transport" },
  { code: "PACKING_MOVING", name: "Packing & Moving Services" },
  { code: "WASTE_REMOVAL", name: "Waste Removal" },
];

export const REVIEW_CRITERIA = [
  "overall",
  "punctuality",
  "communication",
  "quality",
  "care",
  "vehicleCondition",
  "priceAccuracy",
] as const;
export type ReviewCriterion = (typeof REVIEW_CRITERIA)[number];

export const REVIEW_CRITERION_LABELS: Record<ReviewCriterion, string> = {
  overall: "Overall",
  punctuality: "Punctuality",
  communication: "Communication",
  quality: "Quality of work",
  care: "Care for belongings",
  vehicleCondition: "Vehicle condition",
  priceAccuracy: "Price accuracy",
};
