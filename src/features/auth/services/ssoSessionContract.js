export const classifySsoError = (error) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  if (status === 409 && code === 'SSO_BLOCKED') return 'sso-blocked';
  if (status === 401) return 'anonymous';
  if (status === 403 || code === 'EMAIL_IDENTITY_AMBIGUOUS') return 'error';
  return 'throw';
};

export const recoverSsoSession = async ({ checkChildSession, bootstrapSession }) => {
  try {
    return await checkChildSession();
  } catch (error) {
    if (error?.response?.status === 401) {
      return bootstrapSession();
    }
    throw error;
  }
};
