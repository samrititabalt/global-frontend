# CRITICAL: DO NOT DELETE OR MODIFY THIS COMPONENT

## HeroVideoSection Component

This component is **ISOLATED** and **PROTECTED** to prevent Cursor from overwriting the video implementation.

### Purpose
- Displays the homepage hero video from Cloudinary
- Prevents Cursor from replacing video with static images
- Ensures video persists across all code changes

### File Location
`global-frontend/src/components/public/HeroVideoSection.jsx`

### Usage
```jsx
import HeroVideoSection from '../components/public/HeroVideoSection';

// In Home.jsx:
<HeroVideoSection />
```

### IMPORTANT RULES
1. **DO NOT** modify this component
2. **DO NOT** move video logic back into Home.jsx
3. **DO NOT** replace `<HeroVideoSection />` with inline video code
4. **DO NOT** delete this file

### If Video Disappears
1. Check Admin Dashboard → Homepage Video section
2. Re-upload the video (it will be saved to Cloudinary)
3. Check browser console for errors
4. Verify Cloudinary credentials are set in backend .env

### Video Storage
- Videos are stored in **Cloudinary** (not local filesystem)
- Cloudinary URL is stored in `VideoStatus` model
- Local files are temporary and deleted after Cloudinary upload
