import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://e29f1718177589c94510db0553fe0024.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: `a5874753e5e9ecf8f547c9a5b7e52fdb`,
        secretAccessKey: `c2aaf703c68e7da065d6f41f4bf134c566632fe1db859c3f16b5d664c722bd64`,
    },
});

async function main() {
    const response = await s3Client.send(
        new PutBucketCorsCommand({
            Bucket: "print-release-files",
            CORSConfiguration: {
                CORSRules: new Array({
                    AllowedHeaders: ["content-type"],
                    AllowedMethods: ["GET", "PUT", "HEAD"],
                    AllowedOrigins: ["*"],
                    ExposeHeaders: [],
                    MaxAgeSeconds: 3000,
                }),
            },
        })
    );
    console.dir(response)
}

main();
