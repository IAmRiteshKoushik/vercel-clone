const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');

// Init s3Client
const s3Client = new S3Client({
    region: '',
    credentials: {
        accessKeyId: '',
        secretAccessKey: '',
    }
});

const PROJECT_ID = process.env.PROJECT_ID;

async function init(){
    console.log("Executing script.js");
    const outDirPath = path.join(__dirname, 'output');

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', function(data) {
        console.log(data,toString());
    })
    p.stdout.on('error', function(data) {
        console.log('Error', data.toString());
    })

    p.on('close', async function() {
        console.log('Build Complete');
        // Node.js projects build up to a dist/ folder in the public directory
        const distFolderPath = path.join(__dirname, 'output', 'dist');
        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true});
        for (const filePath of distFolderContents ){
            if(fs.lstatSync(filePath).isDirectory()) continue;
                
            const command = new PutObjectCommand({
                Bucket: "",
                Key: `__output/${PROJECT_ID}/${filePath}`,
                Body: fs.createReadStream(filePath),

            })
        }
    })
}


