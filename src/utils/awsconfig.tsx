import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY,
  },
});

export const uploadFileToS3 = async (file: File): Promise<string> => {
  const bucketName = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    console.log('Bucket Name:', import.meta.env.VITE_AWS_S3_BUCKET_NAME);
console.log('AWS Region:', import.meta.env.VITE_AWS_REGION);
console.log('Access Key:', import.meta.env.VITE_AWS_ACCESS_KEY);

    throw new Error("Bucket name is not defined in environment variables");
  }

  const uploadParams = {
    Bucket: bucketName,
    Key: `profilePictures/${Date.now()}-${file.name}`,
    Body: file,
    ContentType: file.type,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    const publicUrl = `https://${bucketName}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    console.log("File uploaded to:", publicUrl);
    return publicUrl;
  } catch (err) {
    console.error("Upload to S3 failed:", err);
    throw new Error("File upload failed");
  }
};
