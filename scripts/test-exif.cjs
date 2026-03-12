const { exiftool } = require('exiftool-vendored');
const fs = require('fs');
const path = require('path');

async function testMetadata() {
    const testFile = path.join('h:', 'Javiermix_web', 'public', 'img', 'Series', 'Rostros_de_metal', 'JMX_9177.avif');
    console.log(`Checking file: ${testFile}`);

    if (!fs.existsSync(testFile)) {
        console.error("File does not exist");
        return;
    }

    try {
        const metadata = await exiftool.read(testFile);
        console.log("Metadata Extracted:");
        console.log(`Model: ${metadata.Model}`);
        console.log(`Lens: ${metadata.LensID || metadata.Lens}`);
        console.log(`Date: ${metadata.DateTimeOriginal}`);
        console.log(`ISO: ${metadata.ISO}`);
        console.log(`Exposure: ${metadata.ExposureTime}`);
        console.log(`FNumber: ${metadata.FNumber}`);
    } catch (err) {
        console.error("Error reading metadata:", err);
    } finally {
        await exiftool.end();
    }
}

testMetadata();
