import { BaseAdProvider } from "./baseProvider";

export class CustomHtmlProvider extends BaseAdProvider {
  constructor() {
    super({
      id: "custom_html",
      name: "Custom Approved Ad Provider",
      description: "Connect custom programmatic networks, direct sponsorship banners, or approved partner ad scripts.",
      website: "https://opennotes.app",
      docUrl: "https://opennotes.app/docs/monetization",
      logo: "/logo.svg",
      category: "Custom & Direct Sponsorships",
      scriptUrlWhitelist: [],
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
    const pid = (config.publisherId || "").trim();

    if (!pid) {
      errors.publisherId = "Custom Partner ID or Tag Identifier is required.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  getRequiredFields() {
    return [
      { name: "publisherId", label: "Partner ID / Tag Reference", required: true, placeholder: "CUSTOM-88192", helpText: "Approved identifier issued by platform admins" },
      { name: "publisherName", label: "Sponsor / Ad Network Name", required: true, placeholder: "Custom Ad Partner" },
      { name: "publisherEmail", label: "Partner Contact Email", required: true, placeholder: "partner@network.com" },
    ];
  }
}
