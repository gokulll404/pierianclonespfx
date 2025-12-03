import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { Site_Name } from "../../../utils/constant";
 
export interface IDescriptionBoardItem {
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
 
export const getDescriptionBoardItems = async (sp: SPFI, listName: string) => {
  const items = await sp.web.lists.getByTitle(listName).items();
  return items.map(item => ({
    ID: item.Id,
    Title: item.Title,
    Description: item.Description,
    Body: item.Body,
    Date: item.Date,
    Image: item.Image,
    Status: item.Status
  }));
};

 
 
export const addDescriptionBoardItem = async (
  sp: SPFI,
  listName: string,
  data: IDescriptionBoardItem
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.add(data);
    return result;
  } catch (err) {
    handleError(err, `addDescriptionBoardItem to ${listName}`);
  }
};
 
export const updateDescriptionBoardItem = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  data: Partial<IDescriptionBoardItem>
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.getById(itemId).update(data);
    return result;
  } catch (err) {
    handleError(err, `updateDescriptionBoardItem ${itemId} in ${listName}`);
  }
};
 
export const deleteDescriptionBoardItem = async (
  sp: SPFI,
  listName: string,
  itemId: number
) => {
  try {
    await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
  } catch (err) {
    handleError(err, `deleteDescriptionBoardItem ${itemId} from ${listName}`);
  }
};
 
export const uploadDescriptionBoardAsync = async (
  sp: SPFI,
  libraryName: string,
  fileInfo: IFileUploadType
): Promise<string | null> => {
  try {
    // Upload the file
    const uploadResult = await sp.web
      .getFolderByServerRelativePath(`/sites/${Site_Name}/DiscussionBoardImages`)
      .files.addUsingPath(fileInfo.name, fileInfo.file, { Overwrite: true });
 
    return uploadResult.data.ServerRelativeUrl;
  } catch (error) {
    console.error("Error uploading DescriptionBoard image to SharePoint:", error);
    return null;
  }
};
 
export const deleteDescriptionBoardImage = async (sp: SPFI, imageUrl: string) => {
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
    console.log("✅ Image deleted from DescriptionBoard library:", serverRelativeUrl);
  } catch (err) {
    console.error("❌ Failed to delete DescriptionBoard image:", err);
  }
};