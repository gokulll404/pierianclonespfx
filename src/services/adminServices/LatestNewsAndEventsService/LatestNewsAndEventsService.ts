import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs"
import "@pnp/sp/lists"
import "@pnp/sp/fields"
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import "@pnp/sp/files";
import '@pnp/sp/folders';
import "@pnp/sp/profiles";
import { Site_Name } from "../../../utils/constant";
 
export interface IFileUploadType {
  name: string;
  file: File;
  newsTitle?: string;
  subText?: string;
  paragraphs?: string;
  dateUploaded?: string;
  time?: string;
  location?: string;
  publishType?: string;
  Image?: string;
}
 
 
const handleError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  throw new Error(`Failed to fetch ${context}`);
};
 
export const getLatestNewsAndEvents = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("ID", "Title", "Description", "Body", "Date", "Created", "Image", "Location", "PublishType","Status").orderBy("Date", false)();
  } catch (err) {
    handleError(err, `getLatestNewsAndEvents for ${listName}`);
  }
};
 
export const addLatestNewsEvent = async (sp: SPFI, listName: string, data: any) => {
  const result = await sp.web.lists.getByTitle(listName).items.add(data);
  return result;
};
 
export const updateLatestNewsEvent = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  data: Partial<IFileUploadType>
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.getById(itemId).update(data);
    return result;
  } catch (err) {
    handleError(err, `updateLatestNewsEvent ${itemId} in ${listName}`);
  }
};
 
export const deleteLatestNewsEvent = async (sp: SPFI, listName: string, itemId: number) => {
  await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
};
 
export const uploadFileToPictureLibraryAsync = async (
  sp: SPFI,
  libraryName: string,
  fileInfo: IFileUploadType
): Promise<string | null> => {
  try {
    // Upload the file
    const uploadResult = await sp.web
      .getFolderByServerRelativePath(`/sites/${Site_Name}/LatestNewsImages`)
      .files.addUsingPath(fileInfo.name, fileInfo.file, { Overwrite: true });
 
 
 
    return uploadResult.data.ServerRelativeUrl;
  } catch (error) {
    console.error("Error uploading file to SharePoint:", error);
    return null;
  }
};
 
 
 
export const deleteFileFromDocumentLibrary = async (sp: SPFI, imageUrl: string) => {
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
    console.log("✅ Image deleted from library:", serverRelativeUrl);
  } catch (err) {
    console.error("❌ Error deleting image from library:", err);
  }
};