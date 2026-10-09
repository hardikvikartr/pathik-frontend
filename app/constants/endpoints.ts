export enum ENDPOINTS {
  LOGIN = "/auth/login",
  REGISTER = "/auth/register",
  GUESTS = "/guests",
  STAFF = "/staff",
  HOTELS = "/hotels",
  ROOMS = "/rooms",
  SEND_OTP = "/auth/sendOtp",
  VERIFY_OTP = "/auth/verifyOtp",
  FORGOT_PASSWORD = "/auth/forgotPassword",
  RESET_PASSWORD = "/auth/resetPassword",
  CHECK_LOGIN_CREDENTIALS = "/auth/checkLoginCredentials",
  GET_CURRENT_USER = "/auth/getProfile",
  LOGOUT = "/auth/logout",
  GET_DASHBOARD_COUNTS = "/hotel/getDashboardCounts",

  //HOTEL
  ADD_HOTEL = "/hotel/addHotel",
  GET_HOTELS = "/hotel/getHotelList",
  CHANGE_HOTEL_STATUS = "/hotel/changeStatusHotel",
  GET_HOTEL_DETAILS = "/hotel/getHotelDetails",
  UPDATE_HOTEL = "/hotel/updateHotel",
  GENERATE_AADHAR_QR_VERIFICATION = "/hotel/generateAadharQR",
  GET_USER_DATA = "/hotel/getUserData",
  GET_ADDRESSES = "/hotel/addresses",
  GET_ROOM_TYPES = "/hotel/getRoomsType",
  ADD_ROOM = "/hotel/addRoom",
  GET_ROOMS = "/hotel/getRoomList",
  GUEST_CHECK_IN = "/hotel/guestCheckIn",
  GET_DOCUMENT_TYPES = "/hotel/getDocumentTypes",
  UPLOAD_IMAGE = "/user/uploadImageViaMulter",
  GET_COUNTRIES = "/user/getCountries",
  HOTEL_COMPLETE_PROFILE = "/hotel/completeProfile",
  ADD_MANUAL_GUEST = "/hotel/addManualGuest",
  GET_PENDING_CHECKOUTS = "/hotel/getPendingCheckouts",
  GUEST_LISTING = "/hotel/guestListing",
  CHECKOUT_GUEST = "/hotel/updateCheckoutStatus",
  DELETE_GUEST = "/hotel/deleteGuest",
  GUEST_DETAILS = "/hotel/guestDetails",
  GET_STAFF_ROLES = "/hotel/getStaffRoles",

  //POLICE
  ADD_POLICE_STATION = "/police_station/addPoliceStation",
  GET_POLICE_STATIONS = "/police_station/getPoliceStationList",
  CHANGE_POLICE_STATION_STATUS = "/police_station/changeStatusPoliceStation",
  GET_POLICE_STATION_DETAILS = "/police_station/getPoliceStationDetails",
  UPDATE_POLICE_STATION = "/police_station/updatePoliceStation",
  GET_REGISTERED_HOTELS = "/hotel/getRegisteredHotels",

  //PERMISSION
  GET_PERMISSIONS = "/user/getPermissions",
  GET_ROLES = "/user/getRolesWithPermissions",
  ADD_ROLE = "/user/addRolesWithPermissions",
  DELETE_ROLE = "user/deleteRolesWithPermissions",

  //SETTINGS
  ADD_SETTING = "/user/addSetting",
  GET_SETTINGS = "/user/getSettingList",
  UPDATE_SETTING = "/user/updateSetting",

  //ADMIN
  ADMIN_SEARCH = '/user/adminGuestList',
}
