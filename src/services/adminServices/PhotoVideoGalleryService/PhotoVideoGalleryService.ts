import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { Site_Name } from "../../../utils/constant";

export interface IPhotoVideoGalleryItem {
    ID: number;
    Title: string;
    Description: string;
    FileType: 'image' | 'video';
    FileUrl: string;
    Date: string;
    FileName: string;
    Status: 'publish' | 'unpublish' | 'draft';
}

export interface IFileUploadType {
    name: string;
    file: File;
    previewUrl: string;
    size: string;
    type: 'image' | 'video';
}

const handleError = (err: any, context: string) => {
    console.error(`Error in ${context}:`, err);
    throw new Error(err?.message || `Failed to execute ${context}`);
};

export const getPhotoVideoGalleryItems = async (
    sp: SPFI,
    libraryName: string
): Promise<IPhotoVideoGalleryItem[]> => {
    try {
        const files = await sp.web
            .getFolderByServerRelativePath(`/sites/${Site_Name}/${libraryName}`)
            .files.expand("ListItemAllFields")
            .orderBy("TimeCreated", false)();

        return files.map((file: any) => ({
            ID: file.ListItemAllFields?.Id,
            Title: file.ListItemAllFields?.FileName || file.Name,
            FileName: file.ListItemAllFields?.FileName,
            Description: file.ListItemAllFields?.FileDescription || "",
            FileType: file.ListItemAllFields?.FileType || (/\.(mp4|mov|avi|webm)$/i.test(file.Name) ? 'video' : 'image'),
            FileUrl: file.ServerRelativeUrl,
            Date: file.ListItemAllFields?.Modified || file.TimeCreated,
            Status: file.ListItemAllFields?.Status || 'draft'
        }));
    } catch (err) {
        handleError(err, "getPhotoVideoGalleryItems");
        return [];
    }
};

const uploadAndSetMetadata = async (
    sp: SPFI,
    libraryName: string,
    fileInfo: IFileUploadType,
    metadata: Partial<IPhotoVideoGalleryItem>
): Promise<string> => {
    try {
        const uniqueName = `${Date.now()}_${fileInfo.name}`;
        const folderPath = `/sites/${Site_Name}/${libraryName}`;

        const result = await sp.web
            .getFolderByServerRelativePath(folderPath)
            .files.addUsingPath(uniqueName, fileInfo.file, { Overwrite: true });

        const uploadedFile = sp.web.getFileByServerRelativePath(result.data.ServerRelativeUrl);
        const item = await uploadedFile.getItem();

        await item.update({
            Title: metadata.FileName,
            FileName: metadata.FileName,
            FileDescription: metadata.Description,
            FileType: metadata.FileType,
            Status: metadata.Status,
        });

        return result.data.ServerRelativeUrl;
    } catch (err) {
        handleError(err, "uploadAndSetMetadata");
        throw err;
    }
};

export const addPhotoVideoGalleryItem = async (
    sp: SPFI,
    libraryName: string,
    data: Partial<IPhotoVideoGalleryItem>,
    file?: File
): Promise<void> => {
    try {
        if (!data.FileName || !data.FileType || !file) {
            throw new Error("FileName, FileType, and File are required to add a new item.");
        }

        const fileInfo: IFileUploadType = {
            name: data.FileName,
            file,
            previewUrl: '',
            size: '',
            type: data.FileType,
        };

        await uploadAndSetMetadata(sp, libraryName, fileInfo, data);
    } catch (err) {
        handleError(err, `addPhotoVideoGalleryItem in ${libraryName}`);
    }
};

export const updatePhotoVideoGalleryItem = async (
    sp: SPFI,
    libraryName: string,
    itemId: number,
    data: Partial<IPhotoVideoGalleryItem>
): Promise<void> => {
    try {
        if (!data.FileName || !data.FileType) {
            throw new Error("FileName and FileType are required for update.");
        }

        await sp.web.lists
            .getByTitle(libraryName)
            .items.getById(itemId)
            .update({
                Title: data.FileName,
                FileName: data.FileName,
                FileDescription: data.Description || "",
                FileType: data.FileType,
                Status: data.Status,
            });
    } catch (err) {
        handleError(err, `updatePhotoVideoGalleryItem ${itemId} in ${libraryName}`);
    }
};

export const deletePhotoVideoGalleryItem = async (
    sp: SPFI,
    libraryName: string,
    itemId: number
): Promise<void> => {
    try {
        await sp.web.lists.getByTitle(libraryName).items.getById(itemId).delete();
    } catch (err) {
        handleError(err, `deletePhotoVideoGalleryItem ${itemId} in ${libraryName}`);
    }
};
