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

export const getRecognizedEmployees = async (sp: SPFI, listName: string) => {
    try {
        return await sp.web.lists.getByTitle(listName).items.select("Id", "EmployeeName", "RecogonitionDescription", "Email", "Designation", "Department", "Image", "RecogonitionDate","EmployeeID","RecognizedBy","RecognizedByDesignation","RecognizedByCompanyName","Status").orderBy("RecogonitionDate", false)();
    } catch (err) {
        handleError(err, `getRecognizedEmployeesData for ${listName}`)
    }
}

export const addRecognizedEmployee = async (sp: SPFI, listName: string, data: any) => {
    try {
        return await sp.web.lists.getByTitle(listName).items.add(data);
    } catch (err) {
        handleError(err, `addRecognizedEmployee to ${listName}`)
    }
}

export const updateRecognizedEmployee = async (sp: SPFI, listName: string, itemId: number, updatedData: any) => {
    try {
        return await sp.web.lists.getByTitle(listName).items.getById(itemId).update(updatedData);
    } catch (err) {
        handleError(err, `updateRecognizedEmployee in ${listName} for ID ${itemId}`)
    }
}

export const deleteRecognizedEmployee = async (sp: SPFI, listName: string, itemId: number) => {
    try {
        return await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
    } catch (err) {
        handleError(err, `deleteRecognizedEmployee in ${listName} for ID ${itemId}`)
    }
}

export const uploadFileToPictureLibraryAsync = async (
  sp: SPFI,
  libraryName: string,
  fileInfo: IFileUploadType
): Promise<string | null> => {
  try {
    // Upload the file
    const uploadResult = await sp.web
      .getFolderByServerRelativePath(`/sites/${Site_Name}/RecogonizedEmployeeImage`)
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
 