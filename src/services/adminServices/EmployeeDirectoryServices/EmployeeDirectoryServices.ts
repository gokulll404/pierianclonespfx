import { SPFI } from "@pnp/sp";
import { Site_Name } from "../../../utils/constant";

export interface IFileUploadType {
  name: string;
  file: File;
}

const handleError = (err: any, context: string) => {
  console.error(`❌ Error in ${context}:`, err);
  throw new Error(`Failed to process ${context}`);
};

// ✅ Get Employees
export const getEmployees = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items.select(
        "ID",
        "EmployeeName",
        "EmployeeID",
        "EmailID",
        "Mobile",
        "BU",
        "Gender",
        "ReportingManager",
        "Designation",
        "Department",
        "JobLocation",
        "ProfilePicture1",
        "DateofJoining",
        "DateofBirth",
        "Status"
      ).orderBy("ID", false)();
  } catch (err) {
    handleError(err, `getEmployeesData for ${listName}`);
  }
};

// ✅ Add Employee
export const addEmployeeData = async (
  sp: SPFI,
  listName: string,
  data: any
) => {
  try {
    return await sp.web.lists.getByTitle(listName).items.add(data);
  } catch (err) {
    handleError(err, `addEmployeeData to ${listName}`);
  }
};

// ✅ Update Employee
export const updateEmployeeData = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  updatedData: any
) => {
  try {
    return await sp.web
      .lists.getByTitle(listName)
      .items.getById(itemId)
      .update(updatedData);
  } catch (err) {
    handleError(err, `updateEmployeeData in ${listName} for ID ${itemId}`);
  }
};

// ✅ Delete Employee

export const canDeleteEmployee = async (
  sp: SPFI,
  employeeId: string,
  relatedLists: string[]
): Promise<{ canDelete: boolean; foundIn: string[] }> => {
  const foundIn: string[] = [];

  for (const list of relatedLists) {
    try {
      const items = await sp.web.lists
        .getByTitle(list)
        .items.filter(`EmployeeID eq '${employeeId}'`)
        .top(1)();

      if (items.length > 0) {
        foundIn.push(list);
      }
    } catch (err) {
      console.error(`Error checking ${list}`, err);
    }
  }

  return { canDelete: foundIn.length === 0, foundIn };
};

export const deleteEmployeeData = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  relatedLists: string[]
) => {
  // Step 0: Get EmployeeID from the current item
  const item = await sp.web.lists.getByTitle(listName).items.getById(itemId).select("EmployeeID")();
  const employeeId = item?.EmployeeID;

  if (!employeeId) {
    throw new Error(`EmployeeID not found for item ${itemId} in ${listName}`);
  }

  // Step 1: Check related lists
  const check = await canDeleteEmployee(sp, employeeId, relatedLists);

  if (!check.canDelete) {
    throw new Error(
      `Cannot delete Employee ID ${employeeId} because it exists in related lists: ${check.foundIn.join(", ")}`
    );
  }

  // Step 2: Delete if safe
  return await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
};


// ✅ Upload Profile Picture to Picture Library
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

// ✅ Delete Profile Picture from Picture Library
export const deleteEmployeePhotoAsync = async (
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
    console.log("✅ Employee photo deleted from library:", serverRelativeUrl);
  } catch (err) {
    console.error("❌ Error deleting employee photo:", err);
  }
};
