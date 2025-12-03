
// Extract tenant URL and site name dynamically
export const defaultTenantUrl = window.location.origin;

const pathParts = window.location.pathname.split("/").filter(Boolean);

// This assumes a typical SharePoint URL like:
// https://aufaitcloud.sharepoint.com/sites/Pierian_EEP/SitePages/...
export const Site_Name = pathParts[0] === "sites" ? pathParts[1] : "";

console.log(Site_Name,"Site_Name")

