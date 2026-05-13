const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { normalizeUploadedImages } = require('../src/services/upload-image.service');

function makeHeicBuffer() {
  return Buffer.from([
    0x00, 0x00, 0x00, 0x18,
    0x66, 0x74, 0x79, 0x70,
    0x68, 0x65, 0x69, 0x63,
    0x00, 0x00, 0x00, 0x00,
    0x68, 0x65, 0x69, 0x63,
  ]);
}

function makeSharpFactory() {
  return (inputPath) => ({
    inputPath,
    rotate() {
      return this;
    },
    jpeg(options) {
      this.jpegOptions = options;
      return this;
    },
    async toFile(outputPath) {
      fs.writeFileSync(outputPath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
    },
  });
}

(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccapi-heic-'));
  const originalPath = path.join(tempDir, 'meal-upload.heic');

  try {
    fs.writeFileSync(originalPath, makeHeicBuffer());

    const files = [
      {
        path: originalPath,
        filename: 'meal-upload.heic',
        originalname: 'IMG_1001.HEIC',
        mimetype: 'image/heic',
        size: fs.statSync(originalPath).size,
      },
    ];

    await normalizeUploadedImages(files, { sharpFactory: makeSharpFactory() });

    assert.equal(files[0].filename, 'meal-upload.jpg');
    assert.equal(files[0].originalname, 'IMG_1001.jpg');
    assert.equal(files[0].mimetype, 'image/jpeg');
    assert.equal(files[0].path, path.join(tempDir, 'meal-upload.jpg'));
    assert.equal(fs.existsSync(originalPath), false, 'original HEIC file should be removed');
    assert.equal(fs.existsSync(files[0].path), true, 'converted JPEG file should exist');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
})();
