import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs"
import "@pnp/sp/lists"
import "@pnp/sp/fields"
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import "@pnp/sp/files";
import '@pnp/sp/folders';
import "@pnp/sp/profiles";

const handleError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  throw new Error(`Failed to fetch ${context}`);
};

let cachedEmployeeData: any[] | null = null;

const getCachedEmployeeData = async (sp: SPFI): Promise<any[]> => {
  if (!cachedEmployeeData) {
    cachedEmployeeData = await getEmployeeListingData(sp, 'EmployeeDirectory') ?? [];
  }
  return cachedEmployeeData;
};

export interface RecognizedEmployeeItem {
  EmployeeName: string;
  Designation: string;
  Department: string;
  RecogonitionDescription: string;
  Image: string;
}

export interface BUHeadItem {
  EmployeeName: string;
  Designation: string;
  Department: string;
  Description: string;
  Image: string;
  teamMemberCount: string;
  Status: string
}


// Dashboard services

export const getDocumentsFromLibraryAsync = async (sp: SPFI, libraryName: string) => {
  try {
    const documents = await sp.web.lists
      .getByTitle(libraryName)
      .items
      .select("Id", "Title", "FileLeafRef", "File/Name", "File/ServerRelativeUrl", "FileType", "FileDescription", "Status")
      .expand("File")
      .filter("Status eq 'publish'")
      .orderBy("Id", false)(); // ✅ latest first

    return documents;
  } catch (err) {
    throw err;
  }
};

export const getNewgetOnboardEmployee = async (
  sp: SPFI,
  newJoinerListName: string
): Promise<{ EmployeeName: string; Image: string }[]> => {
  try {
    const newJoineeItems: any[] = await sp.web.lists
      .getByTitle(newJoinerListName)
      .items.select("EmployeeID")
      .filter("Status eq 'publish'")
      .orderBy("Id", false)();

    const employeeItems: any[] = await getCachedEmployeeData(sp);

    const results = newJoineeItems.map(item => {
      const itemEmpID = item?.EmployeeID?.toString();
      const employee = employeeItems.find(emp => emp?.UserID?.toString() === itemEmpID);

      return {
        EmployeeName: employee?.EmployeeName || '',
        Image: employee?.ProfilePicture1 || ''
      };
    });

    return results;
  } catch (err) {
    handleError(err, `getNewgetOnboardEmployee for ${newJoinerListName}`);
    return [];
  }
};

export const getNewJoiners = async (
  sp: SPFI,
  newJoinerListName: string
): Promise<{ EmployeeName: string; Department: string; UserImage: string }[]> => {
  try {
    const newJoineeItems: any[] = await sp.web.lists
      .getByTitle(newJoinerListName)
      .items.select("EmployeeID")
      .filter("Status eq 'publish'")
      .orderBy("Id", false) // ✅ latest first
      .top(4)();

    const employeeItems: any[] = await getCachedEmployeeData(sp);

    return newJoineeItems.map(item => {
      const itemEmpID = item?.EmployeeID?.toString();
      const employee = employeeItems.find(emp => emp?.UserID?.toString() === itemEmpID);

      return {
        EmployeeName: employee?.EmployeeName || '',
        UserID: employee?.UserID,
        Department: employee?.Department || '',
        UserImage: employee?.ProfilePicture1 || '',
        EmailID: employee?.EmailID,
        DateofBirth: employee?.DateofBirth,
        DateofJoining: employee?.DateofJoining,
        ReportingManager: employee?.ReportingManager,
        Designation: employee?.Designation,
        JobLocation: employee?.JobLocation,
        Mobile: employee?.Mobile,
        Phone: employee?.Phone,
        Status: employee?.Status
      };
    });
  } catch (err) {
    handleError(err, `getNewJoiners for ${newJoinerListName}`);
    return [];
  }
};


export const getCorporateNews = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "Title", "Description", "Date", "Image", "Status")
      .filter("Status eq 'publish'")
      .orderBy("Date", false) // ✅ latest first
      .top(4)();
  } catch (err) {
    handleError(err, `getCorporateNews for ${listName}`);
  }
};


export const getCorporateEventsData = async (sp: SPFI, listName: string) => {
  try {
    const today = new Date().toISOString(); // current date in ISO format

    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "Title", "Description", "Date", "Image", "Status")
      .filter(`Status eq 'publish' and Date le datetime'${today}'`) // ✅ published & before today
      .orderBy("Date", false) // latest first
      .top(4)();
  } catch (err) {
    handleError(err, `getCorporateEventsData for ${listName}`);
    return [];
  }
};




export const getLeadershipMessages = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "Title", "EmployeeName", "Designation", "Message", "UserImage", "Status")
      .filter("Status eq 'publish'")
      .orderBy("Id", false) 
      .top(4)();
  } catch (err) {
    handleError(err, `getLeadershipMessages for ${listName}`);
  }
};


export const getNewsEvents = async (sp: SPFI, listName: string) => {
  try {
    const today = new Date().toISOString(); // current date in ISO

    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "Title", "Description", "Date", "PublishType", "Image", "Status")
      .filter(`Status eq 'publish' and Date le datetime'${today}'`) // ✅ only past or today
      .orderBy("Date", false) // ✅ latest first
      .top(3)();
  } catch (err) {
    handleError(err, `getNewsEvents for ${listName}`);
    return [];
  }
};


export const getDiscussionBoard = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "Title", "Description", "Image", "Status")
      .filter("Status eq 'publish'")
      .orderBy("Id", false)(); // ✅ latest first
  } catch (err) {
    handleError(err, `getDiscussionBoard for ${listName}`);
  }
};


export const getCarousalData = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "Title", "Description", "ThumbnailURL", "MediaType", "LinkURL", "Status")
      .filter("Status eq 'publish'")
      .orderBy("Id", false)(); // ✅ latest first
  } catch (err) {
    handleError(err, `getCarousalData for ${listName}`);
  }
};

export const getJobOpeningsData = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "jobTitle", "JobDescription", "experience", "location", "DatePosted", "Status")
      .filter("Status eq 'publish'")
      .orderBy("DatePosted", false)(); // ✅ latest first
  } catch (err) {
    handleError(err, `getJobOpeningsData for ${listName}`);
  }
};

export const getQuickLinksData = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "CustomURL", "Label", "Tooltip", "Status")
      .filter("Status eq 'publish'")
      .orderBy("Id", false)(); // ✅ latest first
  } catch (err) {
    handleError(err, `getQuickLinksData for ${listName}`);
  }
};

export const getJobOpeningById = async (sp: SPFI, listName: string, id: number) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .select("Id", "jobTitle", "JobDescription", "experience", "JDAttachments", "location", "BU", "DatePosted", "Status")();
  } catch (err) {
    handleError(err, `getJobOpeningById for ${listName} with ID ${id}`);
    return null;
  }
};

export const getNewsEventsById = async (
  sp: SPFI,
  listName: string,
  id: number
) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .select("Id", "Title", "Description", "Date", "Body", "PublishType", "Image", "Status")();
  } catch (err) {
    handleError(err, `getNewsEventsById for ${listName} with ID ${id}`);
    return null;
  }
};


export const getLeadershipMessagesById = async (sp: SPFI, listName: string, id: number) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .select("Id", "Title", "EmployeeName", "Designation", "Message", "UserImage", "Status")();
  } catch (err) {
    handleError(err, `getJobOpeningById for ${listName} with ID ${id}`);
    return null;
  }
};

export const getRecognizedEmployeesById = async (
  sp: SPFI,
  listName: string,
  id: number
) => {
  try {
    const item: any = await sp.web.lists
      .getByTitle(listName)
      .items.getById(id)
      .select("EmployeeID", "RecogonitionDescription", "RecogonitionDate", "RecognizedBy", "RecognizedByDesignation", "RecognizedByCompanyName", "Image", "Status")();

    // fetch employee list data (cached)
    const employeeItems: any[] = await getCachedEmployeeData(sp);

    const itemEmpID = item?.EmployeeID?.toString();
    const employee = employeeItems.find(
      emp => emp?.UserID?.toString() === itemEmpID
    );

    return {
      EmployeeName: employee?.EmployeeName || "",
      Designation: employee?.Designation || "",
      Department: employee?.Department || "",
      RecogonitionDescription: item?.RecogonitionDescription || "",
      RecogonitionDate: item?.RecogonitionDate || "",
      Image: employee?.ProfilePicture1 || "",
      Status: item?.Status || "",
      RecognizedBy: item.RecognizedBy || '',
      RecognizedByDesignation: item.RecognizedByDesignation || '',
      RecognizedByCompanyName: item.RecognizedByCompanyName || '',
    };
  } catch (err) {
    handleError(err, `getRecognizedEmployeesById for ${listName} with ID ${id}`);
    return null;
  }
};

export const getHRAnnouncementsById = async (
  sp: SPFI,
  listName: string,
  id: number
) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .select("ID", "Title", "Description", "Date", "Status")();
  } catch (err) {
    handleError(err, `getHRAnnouncementsById for ${listName} with ID ${id}`);
    return null;
  }
};


export const getHRAnnouncements = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("ID", "Title", "Description", "Date", "Status")
      .filter("Status eq 'publish'")
      .orderBy("Date", false)(); // ✅ latest first
  } catch (err) {
    handleError(err, `getHRAnnouncements for ${listName}`);
  }
};


export const getRecognizedEmployees = async (
  sp: SPFI,
  recognizedListName: string
): Promise<RecognizedEmployeeItem[]> => {
  try {
    const recognizedItems: any[] = await sp.web.lists
      .getByTitle(recognizedListName)
      .items.select("ID", "EmployeeID", "RecogonitionDescription", "RecogonitionDate", "Image", "Status")
      .filter("Status eq 'publish'")
      .orderBy("RecogonitionDate", false)(); // ✅ latest first

    const employeeItems: any[] = await getCachedEmployeeData(sp);

    return recognizedItems.map(item => {
      const itemEmpID = item?.EmployeeID?.toString();
      const employee = employeeItems.find(emp => emp?.UserID?.toString() === itemEmpID);

      return {
        ID: item.ID,
        EmployeeName: employee?.EmployeeName || '',
        Designation: employee?.Designation || '',
        Department: employee?.Department || '',
        RecogonitionDescription: item.RecogonitionDescription || '',
        RecogonitionDate: item.RecogonitionDate || '',
        Image: employee?.ProfilePicture1 || ''
      };
    });
  } catch (err) {
    handleError(err, `getRecognizedEmployees for ${recognizedListName}`);
    return [];
  }
};

export const getUpcomingEvents = async (
  sp: SPFI,
  corporateEventsList: string,
  latestNewsEventsList: string,
  showAll: boolean = false // ⭐ NEW OPTIONAL FLAG
) => {
  try {
    // Normalize today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isoToday = today.toISOString();

    // ⭐ If showAll = true → include ALL events (past + future)
    // ⭐ If showAll = false → include only future events (home page)
    const corporateFilter = showAll
      ? `Status eq 'publish'`
      : `Status eq 'publish' and Date ge datetime'${isoToday}'`;

    const latestFilter = showAll
      ? `Status eq 'publish' and PublishType eq 'Event'`
      : `Status eq 'publish' and PublishType eq 'Event' and Date ge datetime'${isoToday}'`;

    // Corporate Events
    const corporateEvents = await sp.web.lists
      .getByTitle(corporateEventsList)
      .items
      .filter(corporateFilter)
      .select("Id", "Title", "Description", "Date", "Image", "Status")
      .orderBy("Date", true)();

    // LatestNewsAndEvents (ONLY Event type)
    const newsEvents = await sp.web.lists
      .getByTitle(latestNewsEventsList)
      .items
      .filter(latestFilter)
      .select("Id", "Title", "Description", "Date", "Image", "Status", "PublishType")
      .orderBy("Date", true)();

    // Merge + Format
    const combined = [...corporateEvents, ...newsEvents]
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
      .map(event => {
        const dateObj = new Date(event.Date);
        return {
          ...event,
          Day: dateObj.getDate().toString().padStart(2, "0"), // 05
          Month: dateObj.toLocaleString("en-US", { month: "short" }), // Jan, Feb...
        };
      });

    return combined;
  } catch (err) {
    handleError(err, `getUpcomingEvents (combined)`);
    return [];
  }
};


export const getUpcomingEventById = async (
  sp: SPFI,
  corporateEventsList: string,
  latestNewsEventsList: string,
  id: number
) => {
  try {
    // ✅ Try fetching from Corporate Events
    let event = await sp.web.lists
      .getByTitle(corporateEventsList)
      .items.getById(id)
      .select("Id", "Title", "Description", "Date", "Image", "Body", "Status")()
      .catch(() => null);

    // ✅ If not found, try LatestNewsAndEvents (only Events)
    if (!event) {
      event = await sp.web.lists
        .getByTitle(latestNewsEventsList)
        .items.getById(id)
        .select("Id", "Title", "Description", "Body", "Date", "Image", "Status", "PublishType")()
        .catch(() => null);

      // Ensure it's an Event type
      if (event?.PublishType !== "Event") {
        event = null;
      }
    }

    if (!event) return null;

    // ✅ Add Day + Month (short)
    const dateObj = new Date(event.Date);
    return {
      ...event,
      Day: dateObj.getDate().toString().padStart(2, "0"), // e.g., "05"
      Month: dateObj.toLocaleString("en-US", { month: "short" }), // e.g., "Sep"
    };
  } catch (err) {
    handleError(err, `getUpcomingEventById (id=${id})`);
    return null;
  }
};




// Listing services

export const getListingData = async (sp: SPFI, listName: string) => {
  const today = new Date().toISOString();
  try {
    let filterQuery = "Status eq 'publish'"; // ✅ default
    let orderByField = "Date";               // ✅ default field
    let isDescending = false;                // ✅ default order (latest first)

    switch (listName) {
      case "CorporateNews":
        filterQuery = "Status eq 'publish'";
        orderByField = "Date";
        isDescending = false; // latest news first
        break;

      case "CorporateEvents":
        filterQuery = `Status eq 'publish' and Date le datetime'${today}'`;
        orderByField = "Date";
        isDescending = false; // upcoming events (earliest first)
        break;

      case "LatestNewsAndEvents":
        filterQuery = `Status eq 'publish' and Date le datetime'${today}'`;
        orderByField = "Date";
        isDescending = false; // latest first
        break;

      default:
        filterQuery = "Status eq 'publish'";
        orderByField = "Date";
        isDescending = false;
    }

    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Id", "Title", "Description", "Date", "Image", "Status", "PublishType")
      .filter(filterQuery)
      .orderBy(orderByField, isDescending)();
  } catch (err) {
    handleError(err, `getListingData for ${listName}`);
    return [];
  }
};


export const getEmployeeListingData = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select(
        "IsActive",
        "UserID",
        "EmployeeName",
        "EmailID",
        "DateofBirth",
        "DateofJoining",
        "Department",
        "ReportingManager",
        "Designation",
        "JobLocation",
        "ProfilePicture1",
        "Mobile",
        "BU",
        "Gender",
        "Phone",
        "Status"
      )
      .filter("Status eq 'publish'")
      .orderBy("Id", false)(); // ✅ latest first
  } catch (err) {
    handleError(err, `getEmployeeListingData for ${listName}`);
  }
};

export const getBUHeadsDirectory = async (
  sp: SPFI,
  recognizedListName: string
): Promise<BUHeadItem[]> => {
  try {
    return await sp.web.lists
      .getByTitle(recognizedListName)
      .items.select(
        "Id",
        "Image",
        "BUHeadName",
        "BUName",
        "SubBuName",
        "Department",
        "Designation",
        "Description",
        "TeamMemberCount",
        "Status"
      )
      .filter("Status eq 'publish'")
      .orderBy("Id", false)(); // ✅ latest first
  } catch (err) {
    handleError(err, `getBUHeadsDirectory for ${recognizedListName}`);
    return [];
  }
};


// Detail view services

export const getDetailViewData = async (sp: SPFI, listName: string, id: any) => {
  try {
    const item = await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .select("Id", "Title", "Description", "Date", "Image", "Body")();

    return item;
  } catch (err) {
    handleError(err, `getDetailViewData for ${listName} with ID ${id}`);
  }
};



