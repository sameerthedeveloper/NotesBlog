import { BaseAdProvider } from "./baseProvider";

export class GoogleAdManagerProvider extends BaseAdProvider {
  constructor() {
    super({
      id: "google_ad_manager",
      name: "Google Ad Manager",
      description: "Enterprise ad server platform for managing premium direct sales, programmatic partners, and custom ad units.",
      website: "https://admanager.google.com",
      docUrl: "https://support.google.com/admanager",
      logo: "https://www.gstatic.com/images/branding/product/2x/adsense_48dp.png",
      category: "Enterprise Ad Server",
      scriptUrlWhitelist: ["https://securepubads.g.doubleclick.net/tag/js/gpt.js"],
      defaultPlacements: [
        "above_article",
        "below_article",
        "inside_article",
        "sidebar",
        "home_feed",
      ],
    });
  }

  validateConfig(config = {}) {
    const errors = {};
    const networkCode = (config.publisherId || "").trim();

    if (!networkCode) {
      errors.publisherId = "GAM Network Code is required (e.g. 12345678).";
    } else if (!/^\d{6,15}$/.test(networkCode)) {
      errors.publisherId = "Invalid Network Code. GAM Network Codes consist of 6-15 numeric digits.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  getRequiredFields() {
    return [
      { name: "publisherId", label: "Network Code", required: true, placeholder: "12345678", helpText: "Located in GAM > Admin > Global settings > Network code" },
      { name: "publisherName", label: "Publisher Organization", required: true, placeholder: "Media Group LLC" },
      { name: "publisherEmail", label: "GAM Admin Email", required: true, placeholder: "adops@organization.com" },
    ];
  }
}
