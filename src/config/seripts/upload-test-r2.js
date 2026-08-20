import { PutObjectCommand } from "@aws-sdk/client-s3";

import { config } from "../index.js";
import { r2Client } from "../r2.js";

async function uploadTestFile() {
  try {
    const command = new PutObjectCommand({
      Bucket: config.r2_bucket_name,

      Key: "test/hello.txt", //here test is folder

      Body: "Hello from HrungMoto backend!",

      ContentType: "text/plain",
    });

    const result = await r2Client.send(command);

    console.log("Upload successful.");
    console.log(result);
  } catch (error) {
    console.error("Upload failed.");
    console.error(error);
  }
}

uploadTestFile();
