import { GoogleAdSenseProvider } from "./googleAdSense";
import { GoogleAdManagerProvider } from "./googleAdManager";
import { MediaNetProvider } from "./mediaNet";
import { CarbonAdsProvider } from "./carbonAds";
import { CustomHtmlProvider } from "./customHtml";

/**
 * Provider Registry mapping all supported advertising providers.
 */
const registry = {
  google_adsense: new GoogleAdSenseProvider(),
  google_ad_manager: new GoogleAdManagerProvider(),
  media_net: new MediaNetProvider(),
  carbon_ads: new CarbonAdsProvider(),
  custom_html: new CustomHtmlProvider(),
};

/**
 * Get all registered providers as an array
 */
export const getAllProviders = () => Object.values(registry);

/**
 * Get provider instance by ID
 * @param {string} providerId
 * @returns {BaseAdProvider|null}
 */
export const getProviderById = (providerId) => registry[providerId] || null;

/**
 * Validate configuration for a specific provider ID
 */
export const validateProviderConfig = (providerId, config) => {
  const provider = getProviderById(providerId);
  if (!provider) {
    return { valid: false, errors: { providerId: "Unknown or unsupported ad provider." } };
  }
  return provider.validateConfig(config);
};

export default registry;
