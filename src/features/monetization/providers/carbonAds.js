import { BaseAdProvider } from "./baseProvider";

export class CarbonAdsProvider extends BaseAdProvider {
  constructor() {
    super({
      id: "carbon_ads",
      name: "Carbon Ads",
      description: "Exclusive developer, designer, and tech audience ad network with minimal, elegant single-ad units.",
      website: "https://www.carbonads.net",
      docUrl: "https://www.carbonads.net",
      logo: "https://cdn.carbonads.com/carbon.png",
      category: "Developer & Design Ads",
      scriptUrlWhitelist: ["https://cdn.carbonads.com/carbon.js"],
      defaultPlacements: [
        "above_article",
        "sidebar",
        "inside_article",
      ],
    });
  }

  validateConfig(config = {}) {
    const errors = {};
    const serve = (config.publisherId || "").trim();

    if (!serve) {
      errors.publisherId = "Carbon Ads Serve Zone Code / Placement ID is required.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  getRequiredFields() {
    return [
      { name: "publisherId", label: "Serve Code / Placement Zone ID", required: true, placeholder: "CE7I627E / CWYIK53I", helpText: "Your carbon.js script 'serve' parameter code" },
      { name: "publisherName", label: "Developer / Publisher Name", required: true, placeholder: "Creator Name" },
      { name: "publisherEmail", label: "Carbon Contact Email", required: true, placeholder: "creator@domain.com" },
    ];
  }
}
