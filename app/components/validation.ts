// Validation utility functions for the PowerGrid application

// Email validation using regex
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation for Australian phone numbers
export const validatePhone = (phone: string): boolean => {
  // Only allow digits for Australian phone numbers
  const phoneRegex = /^\d+$/;
  // Australian mobile numbers are 10 digits (04XX XXX XXX)
  // Australian landline numbers are 8 digits (XX XXXX XXXX)
  const digitCount = phone.length;
  return phoneRegex.test(phone) && (digitCount === 10 || digitCount === 8);
};

// Text validation for names and locations
export const validateTextOnly = (text: string): boolean => {
  const textRegex = /^[a-zA-Z\s\-\.]+$/;
  return textRegex.test(text) && text.trim().length > 0;
};

// Description validation for length requirements
export const validateDescription = (description: string): boolean => {
  return description.trim().length >= 10 && description.trim().length <= 500;
};

// Admin form validation
export const validateAdminForm = (
  providerForm: any,
  setAdminFormErrors: (errors: {[key: string]: string}) => void
): boolean => {
  const errors: {[key: string]: string} = {};
  
  if (!providerForm.name.trim()) {
    errors.name = 'Provider name is required';
  } else if (!validateTextOnly(providerForm.name)) {
    errors.name = 'Name should contain only letters, spaces, hyphens, and periods';
  }
  
  if (!providerForm.price.trim()) {
    errors.price = 'Price is required';
  } else if (isNaN(parseFloat(providerForm.price)) || parseFloat(providerForm.price) <= 0) {
    errors.price = 'Price must be a positive number';
  }
  
  if (!providerForm.description.trim()) {
    errors.description = 'Description is required';
  } else if (!validateDescription(providerForm.description)) {
    errors.description = 'Description must be between 10 and 500 characters';
  }
  
  if (providerForm.location.trim() && !validateTextOnly(providerForm.location)) {
    errors.location = 'Location should contain only letters, spaces, hyphens, and periods';
  }
  
  if (providerForm.contactEmail.trim() && !validateEmail(providerForm.contactEmail)) {
    errors.contactEmail = 'Please enter a valid email address';
  }
  
  if (providerForm.contactPhone.trim() && !validatePhone(providerForm.contactPhone)) {
    errors.contactPhone = 'Phone must be 8 digits (landline) or 10 digits (mobile) - numbers only';
  }
  
  setAdminFormErrors(errors);
  return Object.keys(errors).length === 0;
};

// User form validation
export const validateUserForm = (
  userProviderForm: any,
  setUserFormErrors: (errors: {[key: string]: string}) => void
): boolean => {
  const errors: {[key: string]: string} = {};
  
  if (!userProviderForm.name.trim()) {
    errors.name = 'Provider name is required';
  } else if (!validateTextOnly(userProviderForm.name)) {
    errors.name = 'Name should contain only letters, spaces, hyphens, and periods';
  }
  
  if (!userProviderForm.price.trim()) {
    errors.price = 'Price is required';
  } else if (isNaN(parseFloat(userProviderForm.price)) || parseFloat(userProviderForm.price) <= 0) {
    errors.price = 'Price must be a positive number';
  }
  
  if (!userProviderForm.description.trim()) {
    errors.description = 'Description is required';
  } else if (!validateDescription(userProviderForm.description)) {
    errors.description = 'Description must be between 10 and 500 characters';
  }
  
  if (userProviderForm.location.trim() && !validateTextOnly(userProviderForm.location)) {
    errors.location = 'Location should contain only letters, spaces, hyphens, and periods';
  }
  
  if (userProviderForm.contactPhone.trim() && !validatePhone(userProviderForm.contactPhone)) {
    errors.contactPhone = 'Phone must be 8 digits (landline) or 10 digits (mobile) - numbers only';
  }
  
  setUserFormErrors(errors);
  return Object.keys(errors).length === 0;
};
