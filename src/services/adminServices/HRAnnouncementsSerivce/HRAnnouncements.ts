import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
 
export interface IHRAnnouncementItem {
  Title: string;
  Date: string;
}
 
export interface IFileUploadType {
  name: string;
  file: File;
}
 
const handleError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  throw new Error(`Failed to execute ${context}`);
};
 
export const getHRAnnouncementItems = async (sp: SPFI, listName: string) => {
  try {
    return await sp.web.lists
      .getByTitle(listName)
      .items
      .select("Title", "Date", "ID","Description","Status").orderBy("Date", false)();
  } catch (err) {
    handleError(err, `getHRAnnouncementItems for ${listName}`);
  }
};
 
 
export const addHRAnnouncementItem = async (
  sp: SPFI,
  listName: string,
  data: IHRAnnouncementItem
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.add(data);
    return result;
  } catch (err) {
    handleError(err, `addHRAnnouncementItem to ${listName}`);
  }
};
 
export const updateHRAnnouncementItem = async (
  sp: SPFI,
  listName: string,
  itemId: number,
  data: Partial<IHRAnnouncementItem>
) => {
  try {
    const result = await sp.web.lists.getByTitle(listName).items.getById(itemId).update(data);
    return result;
  } catch (err) {
    handleError(err, `updateHRAnnouncementItem ${itemId} in ${listName}`);
  }
};
 
export const deleteHRAnnouncementItem = async (
  sp: SPFI,
  listName: string,
  itemId: number
) => {
  try {
    await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
  } catch (err) {
    handleError(err, `deleteHRAnnouncementItem ${itemId} from ${listName}`);
  }
};
 
