# PricingPlans Component

A pixel-perfect, premium React component that displays 4 pricing plans with the FULL TIME plan highlighted as the premium option.

## ✨ Features

- **4 Pricing Cards** in a responsive grid layout
- **FULL TIME Plan Highlighted** - Premium styling with gradient, glow effects, and scale
- **Smooth Animations** - Hover lift effects on all cards, glow on premium card
- **Premium Design** - Rounded corners, soft shadows, gradient buttons
- **Fully Responsive** - Mobile, tablet, and desktop breakpoints
- **Accessible** - Keyboard navigation and focus states
- **No Toggle** - Simple, clean pricing display (no monthly/yearly switch)

## 📦 Installation

The component uses `lucide-react` for icons. Install it if not already installed:

```bash
npm install lucide-react
```

## 🚀 Usage

```jsx
import PricingPlans from './components/PricingPlans';

function MyPage() {
  const handleSelectPlan = (plan) => {
    console.log('Selected plan:', plan);
    // Handle plan selection
    // - Navigate to checkout
    // - Open modal
    // - Add to cart
    // - Call API
  };

  return (
    <div>
      <PricingPlans onSelectPlan={handleSelectPlan} />
    </div>
  );
}
```

## 📋 Plans Displayed

1. **BASIC TRIAL PACK** - $49.99
   - 5 hours / month

2. **STARTER PACK** - $99.99
   - 20 hours / month

3. **FULL TIME** - $3,000 ⭐ (Highlighted Premium)
   - 160 hours / month
   - Weekend Support

4. **LOAD CASH MINIMUM** - $50.00
   - Minimum load (2 hours)

## 🎨 Design Details

### Premium Card (FULL TIME)
- Gradient background (indigo → purple → pink)
- Top border gradient accent
- Glow effect on hover
- Slightly larger scale (105%)
- "Popular" badge at top
- Gradient button (indigo → purple → pink)

### Standard Cards
- White background
- Subtle border
- Standard shadow
- Dark button (gray-900)

### Animations
- **Hover Lift**: Cards lift up on hover (-translate-y)
- **Shadow Increase**: Shadows intensify on hover
- **Button Scale**: Buttons slightly scale on hover/click
- **Glow Effect**: Premium card has animated glow on hover

### Typography
- Plan names: `text-lg font-extrabold`
- Prices: `text-4xl` (standard) / `text-5xl` (premium) `font-black`
- Features: `text-sm font-medium/semibold`

### Spacing
- Card padding: `p-8`
- Section gaps: `gap-6 lg:gap-6`
- Feature spacing: `space-y-5`

## 🎯 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSelectPlan` | `function` | No | Callback fired when a plan is selected. Receives plan object: `{ id, name, price, hours, features, isPopular }` |

## 📱 Responsive Breakpoints

- **Mobile** (`< 640px`): 1 column
- **Tablet** (`≥ 640px`): 2 columns
- **Desktop** (`≥ 1024px`): 4 columns

## 🎨 Customization

### Colors
The component uses Tailwind classes. To customize colors:

1. **Premium Gradient**: Edit the gradient classes in the premium card:
   ```jsx
   // Current: indigo → purple → pink
   className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
   // Change to your brand colors
   ```

2. **Card Backgrounds**: Modify the `bg-` classes

3. **Shadows**: Adjust `shadow-` classes

### Spacing
Modify padding, margins, and gaps using Tailwind spacing utilities.

### Typography
Update font sizes and weights using Tailwind typography classes.

## 🔧 Integration Example

### With React Router
```jsx
import { useNavigate } from 'react-router-dom';
import PricingPlans from './components/PricingPlans';

function PlansPage() {
  const navigate = useNavigate();
  
  const handleSelectPlan = (plan) => {
    navigate(`/checkout/${plan.id}`);
  };

  return <PricingPlans onSelectPlan={handleSelectPlan} />;
}
```

### With API Call
```jsx
import api from '../utils/axios';
import PricingPlans from './components/PricingPlans';

function PlansPage() {
  const handleSelectPlan = async (plan) => {
    try {
      const response = await api.post('/payment/create', { planId: plan.id });
      if (response.data.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <PricingPlans onSelectPlan={handleSelectPlan} />;
}
```

### With Modal
```jsx
import { useState } from 'react';
import PricingPlans from './components/PricingPlans';
import CheckoutModal from './CheckoutModal';

function PlansPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  return (
    <>
      <PricingPlans onSelectPlan={handleSelectPlan} />
      {showModal && (
        <CheckoutModal 
          plan={selectedPlan} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
```

## 🎭 Styling Details

### Shadows
- Standard cards: `shadow-lg` → `shadow-2xl` on hover
- Premium card: `shadow-2xl` → `shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]` on hover

### Borders
- Standard: `border border-gray-200/80`
- Premium: `border-2 border-indigo-300/50`

### Rounded Corners
- Cards: `rounded-3xl`
- Buttons: `rounded-xl`
- Badge: `rounded-full`

## ♿ Accessibility

- All buttons have proper focus states
- Keyboard navigation supported
- Semantic HTML structure
- ARIA labels can be added if needed

## 📝 Notes

- Prices are formatted using `Intl.NumberFormat` with USD currency
- The component is self-contained and doesn't require external state
- All animations use CSS transitions for smooth performance
- The premium card glow effect uses a pseudo-element with blur

## 🔄 Updates

To modify the plans data, edit the `plans` array in `PricingPlans.jsx`:

```jsx
const plans = [
  {
    id: 'trial',
    name: 'BASIC TRIAL PACK',
    price: 49.99,
    hours: '5 hours / month',
    features: [],
    isPopular: false,
  },
  // ... other plans
];
```

---

**Built with React, TailwindCSS, and Lucide React Icons**

