/**
 * OAuth service — resolves a provider profile to a StudyWise user.
 *
 * Rules:
 *   1. If a user already has this provider identity, return them.
 *   2. Otherwise, if a local user exists with the same email, LINK the
 *      provider to that account (account linking, so a user doesn't end
 *      up with two records).
 *   3. Otherwise, create a brand-new user with no password hash.
 */
const userModel = require("../models/userModel");
const ApiError  = require("../utils/ApiError");

const findOrCreateOAuthUser = async ({
  provider,
  providerId,
  email,
  name,
  avatarUrl,
}) => {
  if (!provider || !providerId) {
    throw new ApiError(400, "provider and providerId are required");
  }

  // 1) Existing provider identity
  const byProvider = await userModel.findByProvider(provider, providerId);
  if (byProvider) return byProvider;

  // 2) Link to existing local account with same email
  if (email) {
    const byEmail = await userModel.findByEmail(email);
    if (byEmail) {
      const linked = await userModel.linkProvider(byEmail.id, {
        provider,
        providerId,
        avatarUrl,
      });
      return linked || byEmail;
    }
  }

  // 3) Brand-new account
  const safeName =
    (name && String(name).trim()) ||
    (email ? email.split("@")[0] : `${provider}-user`);
  const safeEmail =
    (email && String(email).trim()) ||
    `${provider}_${providerId}@oauth.local`;

  return userModel.createOAuthUser({
    name: safeName,
    email: safeEmail,
    provider,
    providerId: String(providerId),
    avatarUrl: avatarUrl || null,
  });
};

module.exports = { findOrCreateOAuthUser };