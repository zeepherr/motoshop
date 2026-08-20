import { ListObjectsV2Command } from "@aws-sdk/client-s3";

import { config } from "../index.js";
import { r2Client } from "../r2.js";

async function testR2Connection() {
  try {
    const result = await r2Client.send(
      new ListObjectsV2Command({
        //list object and PutobjectCommand -> put something into it
        Bucket: config.r2_bucket_name,
      }),
    );

    console.log("R2 connected successfully.");
    console.log(result.Contents ?? []);
  } catch (error) {
    console.error("R2 connection failed:");
    console.error(error);
  }
}

testR2Connection();
