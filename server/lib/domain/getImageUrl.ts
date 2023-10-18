import config from '@unstoppabledomains/config';

export const CDN_PREFIX = 'images';

const normalizeImagePath = (path: string): string => {
  if (!path) {
    return '';
  }
  if (path.startsWith(`${CDN_PREFIX}/`)) {
    return path;
  } else {
    return `${CDN_PREFIX}${path}`;
  }
};

export const isDataUri = (src: string = ''): boolean => {
  return src.startsWith('data:');
};

export const isUrl = (src: string = ''): boolean => {
  return src.startsWith('https://');
};

export const getUnoptimizedImageUrl = (path: string): string => {
  if (isDataUri(path)) {
    return path;
  }
  return `${config.ASSETS_BUCKET_URL}/${normalizeImagePath(path)}`;
};

const getImageUrl = (path: string) => {
  if (isDataUri(path) || isUrl(path)) {
    return path;
  }
  return getUnoptimizedImageUrl(path);
};

export default getImageUrl;
