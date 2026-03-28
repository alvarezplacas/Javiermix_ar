# 🎨 Javier Mix V2: Frontend Architecture

This folder contains the UI/UX implementation using **Astro** and **Vanilla CSS**.

## 💎 Design Standards
- **Golden Aesthetics**: Use HSL color variables for precision.
  - `--color-accent`: `#bd9b53` (Gold)
  - `--color-onyx-deep`: `#050505`
- **Split Layouts**: Main pages (Home and Artwork Detail) use a **50/50 split**. 
  - Left side: Fixed visual media.
  - Right side: Scrollable narrative/technical content.
- **Gold-Edged Tabs**: Interactive tabs in the artwork detail page (`obra/[id].astro`) use explicit border-gold styling to differentiate technical, historical, and commercial information.

## 🖼️ Asset Resolution Protocol
The system uses a robust `resolveMediaURL` function to handle two types of assets:
1. **Directus UUIDs**: If the string is a 36-char UUID, it fetches from `https://admin.javiermix.ar/assets/[UUID]`.
2. **Legacy Files**: If it's a filename, it looks in `/uploads/revista/` (legacy Filezilla folder).

## 🛒 Purchase Flow
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores) for persistent cart.
- **Framing Studio**: Integrated component that handles 3D rotation, matting, and custom frame selection.

## 📁 Key Routes
- `/galeria`: Main artwork portfolio.
- `/revista`: Digital magazine.
- `/herramientas/enmarcado`: Standalone virtual framing tool.
- `/dashboard`: Administrative panel.
