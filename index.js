const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const config = require('./config');
const s3 = new AWS.S3({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
});
const argv = require('minimist')(process.argv.slice(2), {
    string: ['file-path'],
    boolean: ['all'],
    '--': true,
    stopEarly: true,
    unknown: function () {
        console.log('invalid params encountered');
    },
});

/**
*   uploadFile - Upload file to aws s3 bucket
*   @param ${string[]} - file paths
* */
function uploadFile(paths = []) {
    paths.forEach((f) => {
        const directoryPath = path.join(__dirname, f)
        fs.readdir(directoryPath, function (err, files) {
            if (err === null) {
                files.forEach(function (file) {
                    console.log(`UPLOADING ${file}...`);
                    fs.readFile(path.join(directoryPath, file), (err, data) => {
                        if (err === null) {
                            const params = {
                                Bucket: config.bucketName,
                                Key: `${config.dirName}/${BASE_DIR}/${f}/${file}`,
                                Body: new Buffer.from(data, 'binary'),
                                ACL: 'public-read',
                            };
                            s3.upload(params, function (s3Err, data) {
                                if (s3Err === null) {
                                    console.log(`Successfully uploaded at ${data.Location}`);
                                } else {
                                    console.log('Error occured when trying to upload to s3: ' + s3Err);
                                }
                            });
                        } else {
                            console.log('Unexpected Error: ' + err);
                        }
                    });
                });
            } else {
                console.log('Unable to scan directory: ' + err);
            }
        });
    })
}

if (argv && argv['file-path']) {
    console.log(argv['file-path']);
    uploadFile(typeof argv['file-path'] === 'string' ? [argv['file-path']] : [...argv['file-path']]);
} else {
    console.log('NO file name provided');
}

