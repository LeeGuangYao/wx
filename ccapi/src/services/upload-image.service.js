const fs = require('fs');
const path = require('path');

const HEIC_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heif',
  'heim',
  'heis',
  'hevm',
  'hevs',
  'mif1',
  'msf1',
]);

const MIME_BY_FORMAT = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
};

const EXT_BY_FORMAT = {
  jpeg: '.jpg',
  png: '.png',
  gif: '.gif',
  webp: '.webp',
};

function createHttpError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function replaceExt(filename, ext) {
  const base = path.basename(filename || 'image', path.extname(filename || ''));
  return `${base || 'image'}${ext}`;
}

function isHeicBuffer(buffer) {
  if (!buffer || buffer.length < 12) return false;
  if (buffer.toString('ascii', 4, 8) !== 'ftyp') return false;

  for (let i = 8; i + 4 <= buffer.length; i += 4) {
    const brand = buffer.toString('ascii', i, i + 4).toLowerCase();
    if (HEIC_BRANDS.has(brand)) return true;
  }
  return false;
}

function detectImageFormat(buffer) {
  if (!buffer || buffer.length < 4) return 'unknown';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg';
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'png';
  }
  if (buffer.toString('ascii', 0, 3) === 'GIF') return 'gif';
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  if (isHeicBuffer(buffer)) return 'heic';
  return 'unknown';
}

async function readHeader(filePath) {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(64);
    const result = await handle.read(buffer, 0, buffer.length, 0);
    return buffer.subarray(0, result.bytesRead);
  } finally {
    await handle.close();
  }
}

async function unlinkQuietly(filePath) {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

async function renameToExt(file, ext, mimetype) {
  const dirname = path.dirname(file.path);
  const nextFilename = replaceExt(file.filename, ext);
  const nextPath = path.join(dirname, nextFilename);

  if (nextPath !== file.path) {
    await fs.promises.rename(file.path, nextPath);
    file.path = nextPath;
  }

  file.filename = nextFilename;
  file.originalname = replaceExt(file.originalname || nextFilename, ext);
  file.mimetype = mimetype;
  file.size = (await fs.promises.stat(file.path)).size;
  return file;
}

async function convertHeicToJpeg(file, sharpFactory) {
  const dirname = path.dirname(file.path);
  const outputFilename = replaceExt(file.filename, '.jpg');
  const outputPath = path.join(dirname, outputFilename);
  const tempOutputPath = outputPath === file.path
    ? path.join(dirname, `${path.basename(file.filename, path.extname(file.filename))}.converted.jpg`)
    : outputPath;

  try {
    await sharpFactory(file.path)
      .rotate()
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(tempOutputPath);
  } catch (err) {
    throw createHttpError('上传失败：HEIC 图片转换失败', 400);
  }

  await unlinkQuietly(file.path);
  if (tempOutputPath !== outputPath) {
    await fs.promises.rename(tempOutputPath, outputPath);
  }

  file.path = outputPath;
  file.filename = outputFilename;
  file.originalname = replaceExt(file.originalname || outputFilename, '.jpg');
  file.mimetype = 'image/jpeg';
  file.size = (await fs.promises.stat(outputPath)).size;
  return file;
}

async function cleanupUploadedFiles(files) {
  for (const file of files || []) {
    await unlinkQuietly(file && file.path);
  }
}

async function normalizeUploadedImages(files, options = {}) {
  const sharpFactory = options.sharpFactory || ((inputPath) => require('sharp')(inputPath));

  try {
    for (const file of files || []) {
      const format = detectImageFormat(await readHeader(file.path));

      if (format === 'heic') {
        await convertHeicToJpeg(file, sharpFactory);
        continue;
      }

      const ext = EXT_BY_FORMAT[format];
      if (!ext) {
        throw createHttpError('上传失败：仅支持 jpg/png/gif/webp/heic/heif 图片', 400);
      }

      await renameToExt(file, ext, MIME_BY_FORMAT[format]);
    }
    return files;
  } catch (err) {
    await cleanupUploadedFiles(files);
    throw err;
  }
}

module.exports = {
  normalizeUploadedImages,
  detectImageFormat,
  isHeicBuffer,
};
