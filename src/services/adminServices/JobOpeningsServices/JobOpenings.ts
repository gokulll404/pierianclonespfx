import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";

export interface IJobOpeningItem {
  Title: string;
  jobTitle: string;
  experience: string;
  location: string;
  JobDescription: string;
  DatePosted: string;
  BU?: string;
  Status?: string;
  JDAttachments?: string; // PDF file path
}

export interface IFileUploadType {
  name: string;
  file: File;
}

const handleError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  throw new Error(err?.message || `Failed to execute ${context}`);
};

export const getJobOpeningItems = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items.select(
        "ID",
        "Title",
        "jobTitle",
        "experience",
        "location",
        "JobDescription",
        "BU",
        "DatePosted",
        "Status",
        "JDAttachments"
      )
      .orderBy("DatePosted", false)();
  } catch (err) {
    handleError(err, `getJobOpeningItems for ${listName}`);
  }
};

export const addJobOpeningItem = async (
  sp: SPFI,
  listName: string,
  data: IJobOpeningItem,
  pdfFile?: File
) => {
  try {
    if (pdfFile) {
      const fileUrl = await uploadPdfToDocumentLibrary(sp, "JDAttachments", pdfFile);
      data.JDAttachments = fileUrl;
    }

    return await sp.web.lists.getByTitle(listName).items.add(data);
  } catch (err) {
    handleError(err, `addJobOpeningItem to ${listName}`);
  }
};

export const updateJobOpeningItem = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  data: Partial<IJobOpeningItem>,
  pdfFile?: File | null
) => {
  try {
    if (pdfFile) {
      const oldItem = await sp.web.lists
        .getByTitle(listName)
        .items.getById(itemId)
        .select("JDAttachments")();

      if (oldItem?.JDAttachments) {
        await deletePdfFromDocumentLibrary(sp, oldItem.JDAttachments);
      }

      const fileUrl = await uploadPdfToDocumentLibrary(sp, "JDAttachments", pdfFile);
      data.JDAttachments = fileUrl;
    }

    return await sp.web.lists.getByTitle(listName).items.getById(itemId).update(data);
  } catch (err) {
    handleError(err, `updateJobOpeningItem ${itemId} in ${listName}`);
  }
};

export const deleteJobOpeningItem = async (
  sp: SPFI,
  listName: string,
  itemId: number
) => {
  try {
    const oldItem = await sp.web.lists
      .getByTitle(listName)
      .items.getById(itemId)
      .select("JDAttachments")();

    if (oldItem?.JDAttachments) {
      await deletePdfFromDocumentLibrary(sp, oldItem.JDAttachments);
    }

    await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
  } catch (err) {
    handleError(err, `deleteJobOpeningItem ${itemId} from ${listName}`);
  }
};

// ✅ Upload PDF to document library (PnPjs v3-safe)
export const uploadPdfToDocumentLibrary = async (
  sp: SPFI,
  libraryName: string,
  file: File
): Promise<string> => {
  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .split(".")[0];
    const ext = file.name.split(".").pop();
    const baseName = file.name.split(".").slice(0, -1).join(".");
    const uniqueFileName = `${baseName}_${timestamp}.${ext}`;

    const folder = sp.web.lists.getByTitle(libraryName).rootFolder;
    const result = await folder.files.addUsingPath(uniqueFileName, file, { Overwrite: true });


    return result.data.ServerRelativeUrl;
  } catch (err) {
    handleError(err, `uploadPdfToDocumentLibrary to ${libraryName}`);
    throw err;
  }
};

// Delete PDF from document library
export const deletePdfFromDocumentLibrary = async (
  sp: SPFI,
  fileUrl: string
): Promise<void> => {
  try {
    await sp.web.getFileByServerRelativePath(fileUrl).delete();
  } catch (err) {
    console.warn(`Could not delete file at ${fileUrl}:`, err);
  }
};


export const clearColumnIfNoPdf = async (
  sp: SPFI,
  listName: string,
  itemId: number
): Promise<void> => {
  try {
    // ✅ Clear the JDAttachments column in the list item
    await sp.web.lists
      .getByTitle(listName)
      .items.getById(itemId)
      .update({
        JDAttachments: ""
      });
  } catch (err) {
    console.warn(`Could not delete file at ${listName}:`, err);
  }
};

