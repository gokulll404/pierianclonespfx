import { SPFI } from "@pnp/sp";
import { Site_Name } from "../../../utils/constant";

export interface IFileUploadType {
  name: string;
  file: File;
}

const handleError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  throw new Error(`Failed to fetch ${context}`);
};

// Fetch all BU Heads
export const getBUHeads = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items.select(
        "Id",
        "BUName",
        "BUHeadName",
        "Image",
        "Description",
        "SubBuName",
        "Department",
        "Designation",
        "TeamMemberCount",
        "Status"
      )
      .orderBy("Id", false)();
  } catch (err) {
    handleError(err, `getBUHeadsData for ${listName}`);
  }
};

// Add new BU Head
export const addBUHead = async (sp: SPFI, listName: string, data: any) => {
  try {
    return await sp.web.lists.getByTitle(listName).items.add(data);
  } catch (err) {
    handleError(err, `addBUHead to ${listName}`);
  }
};

// Update BU Head
export const updateBUHead = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  updatedData: any
) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items.getById(itemId)
      .update(updatedData);
  } catch (err) {
    handleError(err, `updateBUHead in ${listName} for ID ${itemId}`);
  }
};

// Delete BU Head
export const deleteBUHead = async (
  sp: SPFI,
  listName: string,
  itemId: number
) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items.getById(itemId)
      .delete();
  } catch (err) {
    handleError(err, `deleteBUHead in ${listName} for ID ${itemId}`);
  }
};

// Upload image to BUHeadsImages library
export const uploadFileToBUHeadsLibraryAsync = async (
  sp: SPFI,
  libraryName: string,
  fileInfo: IFileUploadType
): Promise<string | null> => {
  try {
    const uploadResult = await sp.web
      .getFolderByServerRelativePath(`/sites/${Site_Name}/BUHeadPhotos`)
      .files.addUsingPath(fileInfo.name, fileInfo.file, { Overwrite: true });

    const fileProperties = await uploadResult.file.select("ServerRelativeUrl")();
    return fileProperties.ServerRelativeUrl;
  } catch (error) {
    console.error("Error uploading file to SharePoint:", error);
    return null;
  }
};

// Delete image from BUHeadsImages library
export const deleteFileFromBUHeadsLibrary = async (
  sp: SPFI,
  imageUrl: string
) => {
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
