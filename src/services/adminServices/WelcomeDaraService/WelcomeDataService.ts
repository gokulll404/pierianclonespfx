import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { Site_Name } from "../../../utils/constant";

export interface IWelcomeDataItem {
  Title: string;
  Image?: string;
  EmployeeName: string;
}

export interface IFileUploadType {
  name: string;
  file: File;
}

const handleError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  throw new Error(`Failed to execute ${context}`);
};

export const getWelcomeDataItems = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("ID", "EmployeeName", "Image", "EmployeeID", "Status").orderBy("Id", false)();
  } catch (err) {
    handleError(err, `getWelcomeDataItems for ${listName}`);
  }
};


export const addWelcomeDataItem = async (
  sp: SPFI,
  listName: string,
  data: IWelcomeDataItem
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.add(data);
    return result;
  } catch (err) {
    handleError(err, `addWelcomeDataItem to ${listName}`);
  }
};

export const updateWelcomeDataItem = async (
  sp: SPFI,
  listName: string,
  itemId: number, // This is EmployeeID (string)
  data: Partial<IWelcomeDataItem>
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName)
      .items
      .getById(itemId)
      .update(data);

    return result;
  } catch (err) {
    handleError(err, `updateWelcomeDataItem ${itemId} in ${listName}`);
  }
};

export const deleteWelcomeDataItem = async (
  sp: SPFI,
  listName: string,
  itemId: number
) => {
  try {

    return await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
  } catch (err) {
    handleError(err, `deleteWelcomeDataItem ${itemId} from ${listName}`);
  }
};

export const uploadWelcomeDataImageAsync = async (
  sp: SPFI,
  libraryName: string,
  fileInfo: IFileUploadType
): Promise<string | null> => {
  try {
    // Upload the file
    const uploadResult = await sp.web
      .getFolderByServerRelativePath(`/sites/${Site_Name}/OnboardEmpImages`)
      .files.addUsingPath(fileInfo.name, fileInfo.file, { Overwrite: true });

    return uploadResult.data.ServerRelativeUrl;
  } catch (error) {
    console.error("Error uploading Employee image to SharePoint:", error);
    return null;
  }
};

export const deleteWelcomeDataImage = async (sp: SPFI, imageUrl: string) => {
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