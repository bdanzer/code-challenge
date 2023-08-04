export const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const correctSelectionFieldPosition = (number) => number - 26;

export const LEFT_BOUNDARY = 25;
export const RIGHT_BOUNDARY = 9;

export const getStartOrEndPositionBoundary = (position) => {
  const windowWidth = window.outerWidth;
  const boundaryRightMax = windowWidth - RIGHT_BOUNDARY;
  const boundaryLeftMax = LEFT_BOUNDARY;

  if (position <= boundaryLeftMax) return boundaryLeftMax;
  if (position >= boundaryRightMax) return boundaryRightMax;
  return position;
};

export const getFullBoundary = () => {
  const windowWidth = window.outerWidth;
  const boundaryMax = windowWidth - RIGHT_BOUNDARY - LEFT_BOUNDARY;

  return boundaryMax;
};

export const getSecondsFromPixels = (pixels) => {
  const oneSecondOfPixels = getFullBoundary() / 10;

  return (pixels / oneSecondOfPixels).toFixed(3);
};

export const getCorrectedLeftBoundarySecondsFromPixels = (pixel) =>
  getSecondsFromPixels(pixel - LEFT_BOUNDARY);

export const getCorrectedRightBoundarySecondsFromPixels = (pixel) =>
  getSecondsFromPixels(pixel - LEFT_BOUNDARY);

export const convertSecondsToPixels = (seconds) => {
  const oneSecondOfPixels = getFullBoundary() / 10;
  return seconds * oneSecondOfPixels + LEFT_BOUNDARY;
};
