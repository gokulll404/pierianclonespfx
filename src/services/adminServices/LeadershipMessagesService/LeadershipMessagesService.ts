import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { Site_Name } from "../../../utils/constant";
 
export interface ILeadershipMessagesItem {
  ID?: number;
  Title: string;
  UserImage: string;
  Designation: string;
  Message: any;
}
 
export interface IFileUploadType {
  name: string;
  file: File;
}
 
const handleError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  throw new Error(`Failed to execute ${context}`);
};
 
export const getLeadershipMessagesItems = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("ID", "Title", "UserImage", "Designation", "Message","Modified","Status").orderBy("Modified", false)();
  } catch (err) {
    handleError(err, `getLeadershipMessagesItems for ${listName}`);
  }
};
 
 
export const addLeadershipMessagesItem = async (
  sp: SPFI,
  listName: string,
  data: ILeadershipMessagesItem
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.add(data);
    return result;
  } catch (err) {
    handleError(err, `addLeadershipMessagesItem to ${listName}`);
  }
};
 
export const updateLeadershipMessagesItem = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  data: Partial<ILeadershipMessagesItem>
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.getById(itemId).update(data);
    return result;
  } catch (err) {
    handleError(err, `updateLeadershipMessagesItem ${itemId} in ${listName}`);
  }
};
 
export const deleteLeadershipMessagesItem = async (
  sp: SPFI,
  listName: string,
  itemId: number
) => {
  try {
    await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
  } catch (err) {
    handleError(err, `deleteLeadershipMessagesItem ${itemId} from ${listName}`);
  }
};
 
export const uploadLeadershipMessagesImageAsync = async (
  sp: SPFI,
  libraryName: string, 
  fileInfo: IFileUploadType
): Promise<string | null> => {
  try {
    const folderPath = `/sites/${Site_Name}/${libraryName}`;
    const uploadResult = await sp.web
      .getFolderByServerRelativePath(folderPath)
      .files.addUsingPath(fileInfo.name, fileInfo.file, { Overwrite: true });
    return uploadResult.data.ServerRelativeUrl;
  } catch (error) {
    console.error("Error uploading image to Document Library:", error);
    return null;
  }
};

export const deleteLeadershipMessagesImage = async (sp: SPFI, imageUrl: string) => {
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