import s3Client from "../utils/s3-client";

export enum FileType {
	DOCUMENT = "DOCUMENT",
	IMAGE = "IMAGE",
	VIDEO = "VIDEO",
}

export const FileTypeStrings: (keyof typeof FileType)[] =
	Object.values(FileType);

export async function uploadFile(
	fileBuffer: Buffer,
	fileName: string,
	fileType: (typeof FileTypeStrings)[number],
	organization: string,
	userId: string,
): Promise<string> {
	const sanitizedFileName = fileName.replace(/\s+/g, "_");
	const timestamp = new Date().toISOString().replace(/[-:.,]/g, "");
	const s3Key = `${fileType}/${organization}/${userId}/${timestamp}_${sanitizedFileName}`;

	try {
		await s3Client.write(s3Key, fileBuffer);
		console.log(`File uploaded successfully to ${s3Key}`);
		return s3Key;
	} catch (error) {
		console.error("Failed to upload file:", error);
		throw error;
	}
}

export async function deleteFile(s3Key: string): Promise<void> {
	try {
		await s3Client.delete(s3Key);
		console.log(`File deleted successfully: ${s3Key}`);
	} catch (error) {
		console.error("Failed to delete file:", error);
		throw error;
	}
}

export function getPresignedURL(s3Key: string | null) {
	if (s3Key === null) return "";

	return s3Client.presign(s3Key, {
		expiresIn: 60 * 60 * 24,
		acl: "public-read",
	});
}

export function getFilePath(s3Key: string): string {
	const url = Bun.env.AWS_S3_URL;
	return `${url}/${s3Key}`;
}

export function getS3Key(filePath: string): string {
	const url = Bun.env.AWS_S3_URL;
	return filePath.replace(`${url}/`, "");
}
