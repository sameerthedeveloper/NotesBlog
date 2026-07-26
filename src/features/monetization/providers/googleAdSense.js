import { BaseAdProvider } from "./baseProvider";

export class GoogleAdSenseProvider extends BaseAdProvider {
  constructor() {
    super({
      id: "google_adsense",
      name: "Google AdSense",
      description: "Monetize your notes and content with automatically targeted display and native ads from Google.",
      website: "https://adsense.google.com",
      docUrl: "https://support.google.com/adsense/answer/9274019",
      logo: "https://www.gstatic.com/images/branding/product/2x/adsense_48dp.png",
      category: "Display & Native Ads",
      scriptUrlWhitelist: ["https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"],
      defaultPlacements: [
        "above_article",
        "below_article",
        "inside_article",
        "sidebar",
        "home_feed",
        "search_results",
        "collections",
      ],
    });
  }

  validateConfig(config = {}) {
    const errors = {};
    const pubId = (config.publisherId || "").trim();

    if (!pubId) {
      errors.publisherId = "AdSense Publisher ID is required (e.g. pub-1234567890123456).";
    } else if (!/^pub-\d{10,20}$/i.test(pubId) && !/^ca-pub-\d{10,20}$/i.test(pubId)) {
      errors.publisherId = "Invalid AdSense Publisher ID format. Must start with 'pub-' or 'ca-pub-' followed by 10-20 digits.";
    }

    if (config.publisherEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.publisherEmail.trim())) {
      errors.publisherEmail = "Invalid email address format.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  getRequiredFields() {
    return [
      { name: "publisherId", label: "AdSense Publisher ID", required: true, placeholder: "pub-1234567890123456", helpText: "Found in Google AdSense Account > Settings > Account Info" },
      { name: "publisherName", label: "Publisher Name", required: true, placeholder: "Full Name or Company Name" },
      { name: "publisherEmail", label: "AdSense Account Email", required: true, placeholder: "email@domain.com" },
    ];
  }
}
