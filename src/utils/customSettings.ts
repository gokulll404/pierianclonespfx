import PIE from '../assets/icons/PIE_icon.png';
import JobOpeningsListingImage from '../assets/images/JobOpening.jpg';
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";

export const NavBarIcon = PIE;

export const JobOpeningsListingIcon = JobOpeningsListingImage;

export const TopNavLinks: string[] = [];

export let appsRequired = [
  { title: "Company Forms", required: false },
  { title: "Employee Report", required: false },
  { title: "Employee Directory", required: true },
  { title: "Business Units", required: true },
  { title: "Marketplace", required: false },
  { title: "Checkout Report", required: false },
  { title: "Business Limits", required: false },
  { title: "Help Desk", required: false },
  { title: "Admin Panel", required: false },
];

export const chatBotRequired = false;

export const checkAdminAccess = async (sp: SPFI) => {
  try {
    const currentUser = await sp.web.currentUser();
    if (currentUser.IsSiteAdmin) {
      appsRequired = appsRequired.map(app =>
        app.title === "Admin Panel" ? { ...app, required: true } : app
      );
    }
  } catch (err) {
    console.error("Error checking admin access:", err);
  }
};
