# Image Specifications

## Login Page - Left Panel Background

- **Recommended Width:** 1920 pixels (or wider for very high-res displays)
- **Recommended Height:** 1080 pixels (or taller, depending on aspect ratio)
- **Aspect Ratio:** Flexible, but 16:9 (e.g., 1920x1080) is a common starting point. The image will use `object-cover`, so it will fill the container, potentially cropping the sides or top/bottom.
- **Format:** Web-optimized (e.g., WebP, JPG, PNG).
- **File Size:** Aim for under 500KB if possible, balancing quality and load time.
- **Content:** Keep in mind that the image serves purely as a background in the current design, as the text overlay was removed.

## Logo

- **File:** `public/logo.png`
- **Used Dimensions:** `width={200}`, `height={55}` (Adjust as needed in `src/app/login/page.tsx`)
- **Styling:** `object-contain` is used to maintain aspect ratio within the specified dimensions.

## Icons (SVGs)

- **Google Logo:** `public/google-logo.svg` (48x48 intrinsic, used at 20x20)
- **Apple Logo:** `public/icons/apple-logo.svg` (24x24 intrinsic, used at 20x20)

*Note: Other icons exist from the previous design (`arrow-left`, `arrow-right`, `play`, `user`) but are not currently used in the Runway layout.* 