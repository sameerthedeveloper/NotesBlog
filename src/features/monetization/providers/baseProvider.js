/**
 * Base Abstract Strategy for Ad Providers
 * Every advertising network handler implements this class interface.
 */
export class BaseAdProvider {
  constructor({ id, name, description, website, docUrl, logo, category, scriptUrlWhitelist = [], defaultPlacements = [] }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.website = website;
    this.docUrl = docUrl;
    this.logo = logo;
    this.category = category;
    this.scriptUrlWhitelist = scriptUrlWhitelist;
    this.defaultPlacements = defaultPlacements;
  }

  /**
   * Validate provider configuration fields
   * @param {Object} config - { publisherId, slotIds, publisherEmail, publisherName, ... }
   * @returns {{ valid: boolean, errors: Object }}
   */
  validateConfig(config = {}) {
    const errors = {};
    if (!config.publisherId || String(config.publisherId).trim().length < 3) {
      errors.publisherId = "Publisher ID is required.";
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Return list of required setup fields for UI step 3
   */
  getRequiredFields() {
    return [
      { name: "publisherId", label: "Publisher ID", required: true, placeholder: "e.g., pub-1234567890" },
      { name: "publisherName", label: "Account Name / Owner", required: true, placeholder: "Your Legal/Business Name" },
      { name: "publisherEmail", label: "Associated Account Email", required: true, placeholder: "name@example.com" },
    ];
  }

  /**
   * Generate provider code snippet / container props for rendering
   */
  renderAd({ placement, slotId, publisherId, isPreview = false }) {
    return {
      providerId: this.id,
      placement,
      slotId: slotId || "default",
      publisherId,
      isPreview,
    };
  }
}
