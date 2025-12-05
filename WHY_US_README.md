# Why Us Page - Implementation Guide

This document provides comprehensive instructions for the pixel-accurate Why Us page implementation that replicates the Horatio website design.

## 🚀 Quick Start

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Navigate to `/why-us` in your browser

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── why-us/
│   │       ├── Header.jsx          # Navigation header with scroll effect
│   │       ├── Hero.jsx            # Hero section with CTA
│   │       ├── FeatureCard.jsx   # Individual feature card
│   │       ├── FeatureCardsRow.jsx # Row of feature cards
│   │       ├── StatsStrip.jsx     # Statistics banner
│   │       ├── ContentSection.jsx # Alternating content sections
│   │       ├── Carousel.jsx       # News/testimonials carousel
│   │       ├── FAQ.jsx            # Accordion FAQ section
│   │       ├── CTA.jsx           # Final call-to-action
│   │       └── Footer.jsx        # Multi-column footer
│   ├── pages/
│   │   └── WhyUsPage.jsx         # Main page component
│   ├── styles/
│   │   └── variables.css         # CSS variables for theming
│   └── App.jsx                  # Routes configuration
├── public/
│   └── assets/                  # Static assets (images, SVGs)
└── tailwind.config.js           # Tailwind configuration
```

## 🎨 Customization Guide

### Changing Colors

The color scheme is defined in two places:

1. **Tailwind Config** (`tailwind.config.js`):
   - Primary colors: Gray scale matching Horatio's brand
   - Accent colors: Blue scale for highlights

2. **CSS Variables** (`src/styles/variables.css`):
   - Update the `:root` variables to change colors globally
   - Rebuild after changes

Example color change:
```css
:root {
  --color-primary-600: #your-color;
}
```

### Changing Fonts

The page uses **Inter** font family. To change:

1. Update `tailwind.config.js`:
```js
fontFamily: {
  sans: ['YourFont', 'fallback', ...],
}
```

2. Update `src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@...');
```

### Replacing Images

All images are located in `public/assets/`:

1. **Hero Image** (`hero.jpg`):
   - Recommended size: 1200x800px
   - Format: JPG or WebP
   - Replace the file in `public/assets/`

2. **Section Images** (`section-1.jpg`, `section-2.jpg`, `section-3.jpg`):
   - Recommended size: 800x600px
   - Format: JPG or WebP

3. **Logo** (`logo.svg`):
   - Recommended size: 200x50px
   - Format: SVG (preferred) or PNG

4. **Feature Icons** (`feature-1.svg` through `feature-4.svg`):
   - Recommended size: 64x64px
   - Format: SVG

**Note**: Components have fallback Unsplash URLs that will load if local files are missing.

### Updating Content

#### Hero Section
Edit `src/components/why-us/Hero.jsx`:
- Update headline text
- Modify description paragraph
- Change CTA button text and links

#### Feature Cards
Edit `src/components/why-us/FeatureCardsRow.jsx`:
- Modify the `features` array
- Update titles, descriptions, and icon paths

#### Content Sections
Edit `src/pages/WhyUsPage.jsx`:
- Update `ContentSection` props:
  - `eyebrow`: Small label above title
  - `title`: Main heading
  - `description`: Paragraph text
  - `features`: Array of bullet points
  - `image`: Image path
  - `reverse`: Boolean for image position

#### FAQ Section
Edit `src/components/why-us/FAQ.jsx`:
- Modify the `faqs` array with your questions and answers

#### Carousel
Edit `src/pages/WhyUsPage.jsx`:
- Update the `carouselItems` array with your news/testimonials

#### Footer
Edit `src/components/why-us/Footer.jsx`:
- Update service and industry lists
- Modify social media links
- Change newsletter form behavior

## 🎯 Key Features

### Responsive Design
- **Mobile**: ≤640px - Stacked layout, hamburger menu
- **Tablet**: 640px-1024px - 2-column grids
- **Desktop**: ≥1024px - Full multi-column layout

### Animations
- **Framer Motion**: Entrance animations on scroll
- **Tailwind**: Hover effects and transitions
- **Custom**: Blob animations in hero section

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all buttons/links
- Semantic HTML structure

## 🔧 Technical Details

### Dependencies
- **React 18.2.0**: UI framework
- **Framer Motion 10.16.16**: Animation library
- **Heroicons 2.1.1**: Icon library
- **TailwindCSS 3.3.5**: Styling framework
- **React Router 6.16.0**: Routing

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance
- Images lazy-load on scroll
- Animations use `will-change` for optimization
- Components use `viewport` detection to trigger animations once

## 📝 Content Guidelines

### ⚠️ Important: Copyright Notice

**DO NOT copy large copyrighted text verbatim from the reference website.**

- Use placeholder copy that matches the structure and tone
- Replace all placeholder text with your own original content
- Match the visual hierarchy and layout, not the exact words

### Writing Style
- Headlines: Bold, clear value propositions
- Descriptions: Concise, benefit-focused
- CTAs: Action-oriented, compelling

## 🐛 Troubleshooting

### Images Not Loading
- Check file paths in `public/assets/`
- Verify filenames match exactly (case-sensitive)
- Check browser console for 404 errors

### Animations Not Working
- Ensure Framer Motion is installed: `npm install framer-motion`
- Check browser console for errors
- Verify viewport detection is working

### Styling Issues
- Clear Tailwind cache: Delete `.next` or `dist` folder
- Rebuild: `npm run build`
- Check Tailwind config syntax

### Route Not Found
- Verify route is added in `App.jsx`
- Check React Router version compatibility
- Ensure component is exported correctly

## 📚 Additional Resources

- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Heroicons Documentation](https://heroicons.com/)
- [React Router Documentation](https://reactrouter.com/)

## 🎨 Design Tokens

### Typography Scale
- Hero: `text-5xl md:text-6xl lg:text-7xl`
- Section Titles: `text-4xl md:text-5xl`
- Card Titles: `text-xl`
- Body: `text-base` or `text-lg`

### Spacing
- Section Padding: `py-24`
- Card Gaps: `gap-8`
- Container Max Width: `max-w-7xl`

### Colors
- Primary Text: `text-gray-900`
- Secondary Text: `text-gray-600`
- Background: `bg-white` or `bg-gray-50`
- Accent: `text-primary-600` or `bg-primary-600`

## ✅ Checklist Before Launch

- [ ] Replace all placeholder images
- [ ] Update all text content with original copy
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify all links work correctly
- [ ] Check accessibility (keyboard navigation, screen readers)
- [ ] Optimize images (compress, use WebP)
- [ ] Test animations performance
- [ ] Verify SEO meta tags
- [ ] Test form submissions (newsletter)
- [ ] Check browser console for errors

## 📞 Support

For issues or questions:
1. Check this README first
2. Review component code comments
3. Check browser console for errors
4. Verify all dependencies are installed

---

**Built with ❤️ using React, TailwindCSS, and Framer Motion**

