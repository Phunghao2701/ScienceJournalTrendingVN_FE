const normalizeUserId = (user) => user?.user_id ?? user?.id ?? user?.sub ?? null;

/**
 * Build the minimum authenticated user identity required by user-scoped caches.
 * Response data wins over JWT claims because it is the backend's canonical shape.
 */
export const resolveLoginUser = ({ responseBody, tokenPayload, fallbackEmail } = {}) => {
  const responseUser = responseBody?.data?.user ?? responseBody?.user ?? null;
  const userId = normalizeUserId(responseUser) ?? normalizeUserId(tokenPayload);

  if (userId === null || userId === undefined || userId === '') return null;

  return {
    user_id: String(userId),
    email: responseUser?.email ?? tokenPayload?.email ?? fallbackEmail ?? null,
    role: responseUser?.role ?? tokenPayload?.role ?? null,
    ...(responseUser?.status || tokenPayload?.status
      ? { status: responseUser?.status ?? tokenPayload?.status }
      : {}),
    ...(responseUser?.auth_source || tokenPayload?.auth_source
      ? { auth_source: responseUser?.auth_source ?? tokenPayload?.auth_source }
      : {}),
  };
};
