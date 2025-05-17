import createImageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "@/lib/sanity/config";

const imageBuilder = createImageUrlBuilder({ projectId, dataset });

export const urlForImage = source => {
  if (!source || !source.asset || typeof source.asset._ref !== 'string') {
    return undefined;
  }

  const refParts = source.asset._ref.split("-");
  if (refParts.length < 3) {
    console.warn("Sanity image _ref is not in the expected format:", source.asset._ref);
    return undefined;
  }
  const dimensions = refParts[2];

  if (typeof dimensions !== 'string' || !dimensions.includes('x')) {
    console.warn("Sanity image dimensions part of _ref is invalid:", dimensions);
    return undefined;
  }

  const [width, height] = dimensions
    .split("x")
    .map(num => parseInt(num, 10));

  const url = imageBuilder
    .image(source)
    .auto("format")
    .width(Math.min(width, "2000"))
    .url();

  return {
    src: url,
    width: width,
    height: height
  };
};
