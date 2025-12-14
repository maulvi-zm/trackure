import { S3Client } from "bun";

const client = new S3Client({
	accessKeyId: Bun.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: Bun.env.AWS_SECRET_ACCESS_KEY,
	bucket: Bun.env.AWS_S3_BUCKET,
	endpoint: Bun.env.AWS_S3_ENDPOINT,
});

export default client;
