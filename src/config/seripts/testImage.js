import { PutObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import { config } from "../index.js";
import { r2Client } from "../r2.js";

const testImage = async () => {
  try {
    const imgBuffer = await readFile("./src/config/seripts/product-test.jpg");
    const command = new PutObjectCommand({
      Bucket: config.r2_bucket_name,
      Key: "test/product-test.jpg",
      Body: imgBuffer,
      ContentType: "image/jpeg",
    });
    const result = await r2Client.send(command);
    console.log("Image uploaded successfully.");
    console.log("ETag:", result.ETag);
  } catch (err) {
    console.log(err);
  }
};

testImage();

//Multer is parser middleware
