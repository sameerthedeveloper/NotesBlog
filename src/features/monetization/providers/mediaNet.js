import { BaseAdProvider } from "./baseProvider";

export class MediaNetProvider extends BaseAdProvider {
  constructor() {
    super({
      id: "media_net",
      name: "Media.net",
      description: "Yahoo! Bing Network contextual ad network offering high-yield display and native ad units.",
      website: "https://www.media.net",
      docUrl: "https://www.media.net/support",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Media.net_logo.svg",
      category: "Contextual Ads",
      scriptUrlWhitelist: ["https://contextual.media.net/nloader.js"],
      defaultPlacements: [
        "above_article",
        "below_article",
        "sidebar",
        "home_feed",
      ],
    });
  }

  validateConfig(config = {}) {
    const errors = {};
    const cid = (config.publisherId || "").trim();

    if (!cid) {
      errors.publisherId = "Media.net Customer ID / Site ID is required.";
    } else if (cid.length < 5) {
      errors.publisherId = "Customer ID must be at least 5 characters long.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  getRequiredFields() {
    return [
      { name: "publisherId", label: "Media.net Customer ID / Site ID", required: true, placeholder: "8CUXXXXXX", helpText: "Found in your Media.net Dashboard header" },
      { name: "publisherName", label: "Account Name", required: true, placeholder: "Publisher Name" },
      { name: "publisherEmail", label: "Account Email", required: true, placeholder: "publisher@domain.com" },
    ];
  }
}
