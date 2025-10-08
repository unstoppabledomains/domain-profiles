export const hasChromePermission = async (
  permission: 'tabs' | 'alarms',
): Promise<boolean> => {
  try {
    return await chrome.permissions.contains({permissions: [permission]});
  } catch (e) {
    // ignore
  }
  return false;
};

export const isChromeExtension = (): boolean => {
  try {
    const manifest = chrome.runtime.getManifest();
    return manifest.manifest_version === 3;
  } catch (e) {
    // ignore
  }
  return false;
};
