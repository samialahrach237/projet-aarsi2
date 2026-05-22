export const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;

  if (data?.errors) {
    const firstFieldErrors = Object.values(data.errors)[0];
    if (Array.isArray(firstFieldErrors) && firstFieldErrors.length) {
      return firstFieldErrors[0];
    }
  }

  return data?.message || fallbackMessage;
};

export const getValidationErrors = (error) => {
  return error?.response?.data?.errors || {};
};
