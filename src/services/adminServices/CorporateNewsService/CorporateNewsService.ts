import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { Site_Name } from "../../../utils/constant";
 
export interface ICorporateNewsItem {
  Title: string;
  Description: string;
  Body: string;
  Date: string;
  Image?: string;
}
 
export interface IFileUploadType {
  name: string;
  file: File;
}
 
const handleError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  throw new Error(`Failed to execute ${context}`);
};
 
export const getCorporateNewsItems = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("ID", "Title", "Description", "Body", "Date", "Image","Status").orderBy("Date", false)(); // No need for 'Time'
  } catch (err) {
    handleError(err, `getCorporateNewsItems for ${listName}`);
  }
};
 
 
export const addCorporateNewsItem = async (
  sp: SPFI,
  listName: string,
  data: ICorporateNewsItem
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.add(data);
    return result;
  } catch (err) {
    handleError(err, `addCorporateNewsItem to ${listName}`);
  }
};
 
export const updateCorporateNewsItem = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  data: Partial<ICorporateNewsItem>
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.getById(itemId).update(data);
    return result;
  } catch (err) {
    handleError(err, `updateCorporateNewsItem ${itemId} in ${listName}`);
  }
};
 
export const deleteCorporateNewsItem = async (
  sp: SPFI,
  listName: string,
  itemId: number
) => {
  try {
    await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
  } catch (err) {
    handleError(err, `deleteCorporateNewsItem ${itemId} from ${listName}`);
  }
};
 
export const uploadCorporateImageAsync = async (
  sp: SPFI,
  libraryName: string,
  fileInfo: IFileUploadType
): Promise<string | null> => {
  try {
    // Upload the file
    await sp.web
      .getFolderByServerRelativePath(`/sites/${Site_Name}/CorporatePhotoGallery`)
      .files.addUsingPath(fileInfo.name, fileInfo.file, { Overwrite: true });
 
    return `/sites/${Site_Name}/CorporatePhotoGallery/${fileInfo.name}`;
  } catch (error) {
    console.error("Error uploading corporate image to SharePoint:", error);
    return null;
  }
};
 
export const deleteCorporateImage = async (sp: SPFI, imageUrl: string) => {
  try {
    let serverRelativeUrl: string;
 
    if (imageUrl.startsWith("http")) {
      serverRelativeUrl = new URL(imageUrl).pathname;
    } else if (imageUrl.startsWith("/")) {
      serverRelativeUrl = imageUrl;
    } else {
      throw new Error("Invalid image URL format.");
    }
 
    await sp.web.getFileByServerRelativePath(serverRelativeUrl).delete();
    console.log("✅ Image deleted from Corporate library:", serverRelativeUrl);
  } catch (err) {
    console.error("❌ Failed to delete corporate image:", err);
  }
};