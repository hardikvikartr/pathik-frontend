export const TOAST_MESSAGES = {
  // Authentication & Permissions
  auth: {
    permissionDenied: "You don't have access to this feature",
  },

  // Validation Errors
  validation: {
    fillAllFields: "Please fill all fields",
    apiIdentifierFormat:
      "API Identifier must use underscores (e.g. create_hotel)",
    apiIdentifierPrefix:
      "API Identifier must start with create, read, update or delete followed by _",
    roleNameRequired: "Please enter a role name",
    permissionRequired: "Please select at least one permission",
    assignRoleRequired: "Please assign a role",
  },

  // Success Messages
  success: {
    permissionCreated: "Permission Created Successfully",
    permissionDeleted: "Permission Deleted",
    roleCreated: "Role Created Successfully",
    roleDeleted: "Role Deleted",
    stationAdded: "Police Station Added Successfully!",
    stationUpdated: "Police Station Updated Successfully",
    hotelDeleted: "Hotel Deleted Successfully",
    guestDeleted: "Guest Deleted Successfully",
    guestsReset: "Guest List Reset Successfully",
    guestsDeleted: "Selected Guests Deleted Successfully",
    hotelCreated: "Hotel Onboarded Successfully",
    hotelUpdated: "Hotel Updated Successfully",
    guestCreated: "Guest Added Successfully",
    guestUpdated: "Guest Updated Successfully",
  },

  // Error Messages
  error: {
    defaultRoleDelete: "Cannot delete default Super Admin role",
    genericError: "An error occurred",
    deleteFailed: "Failed to delete",
  },

  // Info/Warnings
  info: {
    documentViewer: "Document viewer will open here",
  },
};
