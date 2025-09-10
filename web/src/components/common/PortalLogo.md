# PortalLogo Component

A React component that renders the application logo with the same props interface as lucide-react icons.

## Features

- ✅ Same props interface as lucide-react icons
- ✅ Size control with `size`, `width`, and `height` props
- ✅ Color tinting support via CSS filters
- ✅ Full accessibility support
- ✅ TypeScript support
- ✅ Forward ref support
- ✅ Custom className support

## Installation

The component is already set up in the project. Make sure you have the logo image at `src/assets/logo.png`.

## Usage

### Basic Usage

```tsx
import { PortalLogo } from "@/components/common";

function App() {
  return (
    <div>
      <PortalLogo />
      <PortalLogo size={32} />
      <PortalLogo width={48} height={48} />
    </div>
  );
}
```

### With Custom Styling

```tsx
import { PortalLogo } from "@/components/common";

function Header() {
  return (
    <header className="flex items-center gap-3">
      <PortalLogo 
        size={40} 
        className="rounded-lg border-2 border-gray-300 p-2" 
      />
      <h1>My App</h1>
    </header>
  );
}
```

### With Color Tinting

```tsx
import { PortalLogo } from "@/components/common";

function ThemedLogo() {
  return (
    <div>
      <PortalLogo size={32} color="blue" />
      <PortalLogo size={32} color="green" />
      <PortalLogo size={32} color="red" />
    </div>
  );
}
```

### With Accessibility

```tsx
import { PortalLogo } from "@/components/common";

function AccessibleLogo() {
  return (
    <PortalLogo 
      size={32}
      aria-label="Gardeners for Africa Portal Logo"
      role="img"
    />
  );
}
```

## Props

The component accepts all the same props as lucide-react icons:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number \| string` | `24` | Size of the logo (applies to both width and height) |
| `width` | `number \| string` | `24` | Width of the logo |
| `height` | `number \| string` | `24` | Height of the logo |
| `className` | `string` | - | Additional CSS classes |
| `color` | `string` | - | Color tint to apply (uses CSS filters) |
| `aria-label` | `string` | `"Portal Logo"` | Accessible label for screen readers |
| `aria-hidden` | `boolean` | - | Hide from screen readers |
| `role` | `string` | `"img"` | ARIA role |
| `style` | `React.CSSProperties` | - | Inline styles |
| `...props` | `React.ImgHTMLAttributes<HTMLImageElement>` | - | All other img element props |

## Examples

See `PortalLogoExample.tsx` for comprehensive usage examples.

## Notes

- The component uses a PNG image, so color changes are applied via CSS filters
- The `color` prop supports common color names and hex values
- Size can be specified as a number (pixels) or string with units
- The component is fully typed with TypeScript
