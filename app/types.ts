export interface UploadedFile {
  file: File;
  url: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  code: number;
}

export interface Permission {
  id: string;
  permission_name: string;
  identifier: string;
  grouping?: string;
}

export interface Role {
  id: string;
  name: string;
  permissionIds: string[];
}

export interface PoliceStation {
  id: string;
  district: string;
  name: string;
  sector: string;
  zone: string;
  division: string;
  email: string;
  mobile: string;
  createdAt: string;
  isDeleted?: boolean;
  roleId?: string;
  permissions?: string[];
  status?: "active" | "inactive";
  state_id?: number;
  district_id?: number;
  role_name?: string;
}

export interface Hotel {
  id: string;
  hotel_name: string;
  hotel_code?: string;
  username?: string;
  password?: string;
  phone_no?: string;
  landline_no?: string;
  email: string;
  address: string;
  address_data?: any[];
  hotel_area?: string;
  pin_code?: string;
  district_id?: number;
  division?: string;
  sector?: string;
  zone?: string;
  police_station: string;
  police_station_id?: string;
  latitude?: string;
  longitude?: string;
  manager_name?: string;
  manager_email?: string;
  manager_phone?: string;
  owner_name: string;
  owner_email?: string;
  owner_phone?: string;
  accommodation_type?: string;
  no_of_rooms?: number;
  website_url?: string;
  profile_image?: string;
  status: "active" | "inactive" | "pending";
  block_status?: "blocked" | "unblocked";
  is_active?: boolean;
  login_status?: string;
  last_login?: string;
  token?: string;
  created_at?: string;
  updated_at?: string;
  compliance?: HotelCompliance;
}

export interface HotelCompliance {
  ownerAadhaar?: string; // URL
  managerAadhaar?: string; // URL
  cctv?: {
    available: boolean;
    count?: number;
    cameraType?: "Dome" | "Bullet" | "PTZ" | "Other";
    recordingLocation?: string;
    backupDays?: number;
    coverage?: string[]; // Gallery, Entrance, etc.
  };
  fireSafety?: {
    expiryDate: string;
    certificate?: string; // URL
  };
  documents?: {
    amcGstCertificate?: string; // URL
    propertyGstCertificate?: string; // URL
    visitingCard?: string; // URL
  };
  ownership?: {
    type: "Owned" | "Rented";
    propertyDoc?: string; // URL (for Owned)
    rentAgreement?: string; // URL (for Rented)
    propertyTaxReceipt?: string; // URL
  };
  isProfileComplete?: boolean;
}

export interface Room {
  id: string; // e.g., "A-101"
  wing: string; // "A"
  number: string; // "101"
  type?: string; // "Single", "Double", etc.
  status: "available" | "occupied" | "maintenance";
  floor?: string;
  hotelId?: string; // To link to a hotel if needed in future
  address?: string; // Address alias/label for multi-property setups
}

export interface Booking {
  id: string;
  primaryGuestId?: string; // Can be linked after guest creation
  roomNumber: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate?: string;
  checkOutTime?: string;
  status: "active" | "completed" | "cancelled";
  guestIds: string[];
  purpose?: string;
  comingFrom?: string;
  goingTo?: string;
  noOfAdult?: number | string;
  noOfChild?: number | string;
}

export interface Guest {
  id: string | number;
  bookingId?: string;
  checkInType?: string;
  // Personal
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  profileImage?: string;
  hotelId?: string | number;
  hotelName?: string;

  // Contact
  mobileNo: string;
  email?: string;
  address: string;
  city: string;
  state: string | number;
  district?: string;
  country: string | number;
  zipCode: string | number;

  // Identity
  residencyType?: "Indian" | "Foreign";
  verificationMethod?: "quick_aadhaar" | "manual";
  documentType: string;
  documentNumber: string;
  documentImage?: string; // URL or Base64
  documentFiles?: UploadedFile[]; // For upload handling

  // Vehicle
  vehicleType?: string;
  vehicleRegNo?: string;

  // Residency / Foreigner Details
  nationality?: string;
  passportImage?: string;
  visaImage?: string;
  visaExpiryDate?: string;

  // Additional
  noOfAdult?: string | number;
  noOfChild?: string | number;

  // Meta
  status?: string;
  collapsed?: boolean; // UI state

  // Forms might have extra fields not in DB
  aadhaarVerified?: boolean;
  isPrimary?: boolean;

  // Booking details associated with the guest
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  roomNumber?: string;
  purpose?: string;
  // Extended Aadhaar Details
  careOf?: string;
  createdAt?: string;
  credentialIssuingDate?: string;
  enrolmentDate?: string;
  enrolmentNumber?: string;
  isNri?: boolean;
  landmark?: string;
  localBuilding?: string;
  localCareOf?: string;
  localDistrict?: string;
  localLandmark?: string;
  localLocality?: string;
  localPoName?: string;
  localResidentName?: string;
  localState?: string;
  localStreet?: string;
  localSubDistrict?: string;
  localVtc?: string;
  locality?: string;
  maskedEmail?: string;
  maskedMobile?: string;
  poName?: string;
  regionalAddress?: string;
  street?: string;
  subDistrict?: string;
  transactionId?: string;
  updatedAt?: string;
  vtc?: string;
  aadhaarGuestId?: number;
  manualEntryReason?: string;
  foreignDocumentType?: string;
  passportNo?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
}

export enum API_METHODS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export interface Staff {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;

  employeeType: string; // Manager, Waiter, etc.
  employeeTypeOther?: string; // If 'Other' selected

  mobileNo: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;

  profileImage?: string;

  // Identity (Same as Guest)
  residencyType?: "Indian" | "Foreign";
  verificationMethod?: "quick_aadhaar" | "manual";
  documentType: string;
  documentNumber: string;
  documentImage?: string;

  // Foreigner specific (if we allow foreign staff)
  nationality?: string;
  passportImage?: string;
  visaImage?: string;
  visaExpiryDate?: string;

  status: "active" | "inactive";
  joinedDate: string;
  exitDate?: string;
  aadhaarVerified?: boolean;
}

export interface GuestWizardValues extends Guest {
  roomNumber: string;
  roomId: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  purpose: string;
  aadhaarVerified?: boolean;
  faceVerification?: boolean;
  checkInType?: string;
}

export interface SearchLog {
  id: number;
  // Search Criteria
  startDate?: string;
  endDate?: string;
  dateType?: "checkIn" | "checkOut"; // New
  nameSearch?: string;
  numberSearch?: string;
  addressSearch?: string; // New
  emailSearch?: string; // New
  idNumberSearch?: string; // New
  hotelNameSearch?: string; // New
  hotelDistrictSearch?: string; // New
  stateSearch?: string; // New

  // Officer Details
  officerName: string;
  officerNumber: string; // New
  officerDesignation: string; // New
  placeOfDuty: string; // New
  purposeofSearch: string;
  complaintNumber?: string; // Made optional per new req? User didn't specify complaint number explicitly in "that's it" list but "details in form" usually implies comprehensive. The new list didn't mention it but old one had it. I will keep it but maybe optional or just keep it. User list: "officer name, officer number, officer designation, place of duty, purpose of search, guest name, guest number, address, email, id number, check in - checkout radio buttons, dates, hotel name, hotel district, state". Complaint number is MISSING in the new list. I'll make it optional or remove if I strictly follow. I'll make it optional for now to be safe.

  total_number_of_result: number;
  date_and_time: string;
}

export interface Watchdog {
  id: number;
  createdAt: string;
  status: string;
  watchdogTitle: string;
  personName: string;
  contact1: string;
  contact2?: string;
  contact3?: string;
  email1?: string;
  email2?: string;
  aadhaar?: string;
  pan?: string;
  votingCard?: string;
  drivingLicence?: string;
  passport?: string;
  country: string;
  state: string;
  district: string;
  city: string;
  startDate: string;
  endDate?: string;
  reportingOfficerName: string;
  reportingOfficerNo?: string;
  reportingOfficerEmail?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  image?: string; // Image URL or base64
  role: "SUPER_ADMIN" | "POLICE_STATION" | "HOTEL" | "all";
  isRead: boolean;
  createdAt: string;
}
