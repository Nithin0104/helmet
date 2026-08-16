import { useState } from 'react';
import { Star, Truck, Undo2, ShieldCheck } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { ACCENTS, ACCENT_KEYS } from '../theme/accents';
import { useCart } from '../cart/CartContext';
import {
  Icon,
  Button,
  ActionButton,
  SaveButton,
  Chip,
  Card,
  Tabs,
  Breadcrumbs,
  Pagination,
  Modal,
  Tooltip,
  BottomSheet,
  TextInput,
  Toggle,
  Checkbox,
  SearchBar,
  ColorSwatch,
  RangeSlider,
  Accordion,
  Badge,
  StatCard,
  Rating,
  QtyStepper,
  Skeleton,
  Spinner,
  ProgressBar,
  Toast,
  Carousel,
  HoverZoom,
  CountUp,
  Marquee,
  Select,
  SegmentedToggle,
  EmptyState,
  PromoTile,
  SizeGrid,
  SpecTable,
  TrustList,
} from '../components/primitives';
import {
  FilterGroup,
  AppliedFilterBar,
  ProductGallery,
  SwatchPicker,
  ReviewSummary,
  ProductReview,
  StickyBuyBar,
  SizeGuideSheet,
} from '../components/composite';
import styles from './ShowcasePage.module.css';

interface NavSection {
  id: string;
  label: string;
  items: string[];
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'buttons', label: 'Buttons', items: ['Button', 'ActionButton', 'SaveButton', 'Chip'] },
  { id: 'cards', label: 'Cards', items: ['Card'] },
  { id: 'navigation', label: 'Navigation', items: ['Tabs', 'Breadcrumbs', 'Pagination'] },
  { id: 'overlays', label: 'Overlays', items: ['Modal', 'Tooltip', 'BottomSheet'] },
  {
    id: 'forms',
    label: 'Forms',
    items: ['TextInput', 'Toggle', 'Checkbox', 'SearchBar', 'ColorSwatch', 'RangeSlider', 'Select', 'SegmentedToggle'],
  },
  { id: 'data', label: 'Data display', items: ['Accordion', 'Badge', 'StatCard'] },
  { id: 'inputs', label: 'Inputs', items: ['Rating', 'QtyStepper'] },
  { id: 'feedback', label: 'Feedback', items: ['Skeleton', 'Spinner', 'ProgressBar', 'Toast', 'EmptyState'] },
  { id: 'media', label: 'Media', items: ['Carousel', 'HoverZoom'] },
  { id: 'motion', label: 'Motion', items: ['CountUp', 'Marquee'] },
  { id: 'sections', label: 'Sections', items: ['PromoTile'] },
  { id: 'filters', label: 'Filters', items: ['FilterGroup', 'AppliedFilterBar'] },
  {
    id: 'pdp',
    label: 'PDP',
    items: [
      'ProductGallery',
      'SwatchPicker',
      'SizeGrid',
      'SpecTable',
      'TrustList',
      'ReviewSummary',
      'ProductReview',
      'StickyBuyBar',
      'SizeGuideSheet',
    ],
  },
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function AccentSwitcher() {
  const { accentKey, setAccent } = useTheme();
  return (
    <div className={styles.accentRow}>
      {ACCENT_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => setAccent(key)}
          aria-label={`Set accent to ${key}`}
          aria-pressed={key === accentKey}
          className={styles.accentSwatch}
          style={{
            background: ACCENTS[key].base,
            outline: key === accentKey ? `2px solid var(--text)` : '2px solid transparent',
          }}
        />
      ))}
    </div>
  );
}

function NavRail() {
  return (
    <nav className={styles.rail} aria-label="Primitives">
      <a href="#top" className={styles.railBrand}>
        APEXLINE <span>/ Design System</span>
      </a>
      {NAV_SECTIONS.map((section) => (
        <div key={section.id} className={styles.railGroup}>
          <p className={styles.railHeading}>{section.label}</p>
          <ul className={styles.railList}>
            {section.items.map((item) => (
              <li key={item}>
                <a href={`#${slug(item)}`} className={styles.railLink}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function Bay({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div id={slug(name)} className={styles.bay}>
      <div className={styles.bayHeader}>
        <h3 className={styles.bayTitle}>{name}</h3>
      </div>
      <div className={styles.bayDemo}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

/* ---- interactive demo blocks ---- */

function ButtonDemo() {
  return (
    <Row>
      <Button variant="lift" label="Lift" />
      <Button variant="fill" label="Fill" />
      <Button variant="shine" label="Shine" />
      <Button variant="ghost" label="Ghost" />
      <Button variant="press" label="Press" />
      <Button variant="danger" label="Danger" />
      <Button variant="icon" aria-label="Icon button">
        <Icon icon={Star} />
      </Button>
      <Button variant="fill" label="Loading" loading />
      <Button variant="fill" label="Disabled" disabled />
      <Button variant="fill" size="sm" label="Small" />
      <Button variant="fill" size="lg" label="Large" />
    </Row>
  );
}

function ActionButtonDemo() {
  const { add, count } = useCart();
  return (
    <Row>
      <ActionButton
        variant="add-to-cart"
        onClick={() =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              add({ productId: 'velocity-rs-carbon', name: 'Velocity RS Carbon', brand: 'Apexline', price: 42999 });
              resolve();
            }, 700);
          })
        }
      />
      <ActionButton variant="submit" onClick={() => new Promise((r) => setTimeout(r, 700))} />
      <span className={styles.hint}>{count} in cart</span>
    </Row>
  );
}

function SaveButtonDemo() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  return (
    <Row>
      <SaveButton saved={a} onToggle={setA} label="Velocity RS Carbon" />
      <SaveButton saved={b} onToggle={setB} label="Urban GT Modular" />
      <SaveButton saved={false} onToggle={() => {}} label="Trail Pro ADV" size="sm" />
      <SaveButton saved onToggle={() => {}} label="Vega Tour" disabled />
    </Row>
  );
}

function ChipDemo() {
  const [selected, setSelected] = useState<string[]>(['m']);
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <Row>
      <Chip variant="select" label="S" selected={selected.includes('s')} onToggle={() => toggle('s')} />
      <Chip variant="select" label="M" selected={selected.includes('m')} onToggle={() => toggle('m')} />
      <Chip variant="select" label="L" selected={selected.includes('l')} onToggle={() => toggle('l')} />
      <Chip variant="filter" label="Full-face" count={12} />
      <Chip variant="filter" label="Removable" removable onRemove={() => {}} />
      <Chip variant="nav" label="New" selected />
      <Chip variant="nav" label="Bestsellers" />
    </Row>
  );
}

function CardDemo() {
  return (
    <Row>
      <Card variant="product" brand="Apexline" title="Velocity RS Carbon" price={42999} badge="Bestseller" />
      <Card variant="category" title="Full-face" />
      <Card variant="review" title="Worth every rupee">
        Been riding with this for three months on the expressway. Barely notice the weight.
      </Card>
      <Card variant="feature" title="ISI + ECE 22.06 certified">
        Every shell is tested to international impact standards.
      </Card>
    </Row>
  );
}

function TabsDemo() {
  const items = [
    { id: 'overview', label: 'Overview', content: 'Hand-laid carbon-fibre shell.' },
    { id: 'specs', label: 'Specs', content: 'Weight: 1,350g ± 50g (size M).' },
    { id: 'reviews', label: 'Reviews', content: '128 verified reviews, 4.7 average.' },
  ];
  return (
    <div className={styles.stack}>
      <Tabs items={items} variant="underline" />
      <Tabs items={items} variant="pill" />
      <Tabs items={items} variant="segment" fullWidth />
    </div>
  );
}

function BreadcrumbsDemo() {
  const items = [{ label: 'Home', href: '#' }, { label: 'Full-face', href: '#' }, { label: 'Velocity RS Carbon' }];
  return (
    <div className={styles.stack}>
      <Breadcrumbs items={items} separator="chevron" />
      <Breadcrumbs items={items} separator="slash" />
      <Breadcrumbs items={items} separator="dot" />
    </div>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(4);
  return (
    <div className={styles.stack}>
      <Pagination total={12} page={page} onChange={setPage} variant="numbers" />
      <Pagination total={6} variant="dots" defaultPage={2} />
    </div>
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <Row>
      <Button variant="ghost" label="Open center modal" onClick={() => setOpen(true)} />
      <Button variant="ghost" label="Open sheet modal" onClick={() => setSheetOpen(true)} />
      <Modal
        variant="center"
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm size"
        footer={<Button variant="fill" label="Confirm" onClick={() => setOpen(false)} />}
      >
        Sizing to M based on your last order. Change it in your profile any time.
      </Modal>
      <Modal variant="sheet" open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters">
        Sheet-style modal, anchored to the bottom on mobile viewports.
      </Modal>
    </Row>
  );
}

function TooltipDemo() {
  return (
    <Row>
      <Tooltip content="Top placement" placement="top">
        <Button variant="ghost" label="Top" />
      </Tooltip>
      <Tooltip content="Bottom placement" placement="bottom">
        <Button variant="ghost" label="Bottom" />
      </Tooltip>
      <Tooltip content="Left placement" placement="left">
        <Button variant="ghost" label="Left" />
      </Tooltip>
      <Tooltip content="Right placement" placement="right">
        <Button variant="ghost" label="Right" />
      </Tooltip>
      <Tooltip content="Click to toggle" trigger="click">
        <Button variant="ghost" label="Click trigger" />
      </Tooltip>
    </Row>
  );
}

function BottomSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Row>
      <Button variant="ghost" label="Open bottom sheet" onClick={() => setOpen(true)} />
      <BottomSheet title="Select size" open={open} onClose={() => setOpen(false)}>
        <div className={styles.stack}>
          {['S', 'M', 'L', 'XL'].map((s) => (
            <Button key={s} variant="ghost" label={s} fullWidth onClick={() => setOpen(false)} />
          ))}
        </div>
      </BottomSheet>
    </Row>
  );
}

function TextInputDemo() {
  return (
    <div className={styles.stack}>
      <TextInput label="Email" placeholder="you@example.com" />
      <TextInput label="Promo code" placeholder="APEX10" hint="Optional" />
      <TextInput label="Pincode" placeholder="400001" error="Enter a valid 6-digit pincode" />
      <TextInput label="Disabled" placeholder="—" disabled />
    </div>
  );
}

function ToggleDemo() {
  return (
    <Row>
      <Toggle size="small" defaultChecked label="Small" />
      <Toggle size="medium" defaultChecked label="Medium" />
      <Toggle size="large" label="Large" />
      <Toggle label="Disabled" disabled />
    </Row>
  );
}

function CheckboxDemo() {
  return (
    <Row>
      <Checkbox shape="rounded" defaultChecked label="Rounded" />
      <Checkbox shape="circle" defaultChecked label="Circle" />
      <Checkbox indeterminate label="Indeterminate" />
      <Checkbox label="Disabled" disabled />
    </Row>
  );
}

function SearchBarDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div className={styles.stack}>
      <SearchBar placeholder="Search helmets…" onSubmit={() => setLoading(true)} loading={loading} />
      <SearchBar placeholder="Disabled search" disabled />
    </div>
  );
}

function ColorSwatchDemo() {
  const colors = [
    { value: 'matte-black', hex: '#1a1a1c', name: 'Matte Black' },
    { value: 'racing-red', hex: '#c0392b', name: 'Racing Red' },
    { value: 'pearl-white', hex: '#f4f3f1', name: 'Pearl White' },
    { value: 'gunmetal', hex: '#5a5d63', name: 'Gunmetal', disabled: true },
  ];
  return (
    <Row>
      <ColorSwatch colors={colors} size="small" />
      <ColorSwatch colors={colors} size="medium" />
      <ColorSwatch colors={colors} size="large" />
    </Row>
  );
}

function RangeSliderDemo() {
  return (
    <div className={styles.stack}>
      <RangeSlider min={0} max={100} defaultValue={40} prefix="₹" suffix="k" />
      <RangeSlider min={0} max={100} defaultValue={[20, 70]} prefix="₹" suffix="k" />
    </div>
  );
}

function AccordionDemo() {
  const items = [
    { q: 'How do I pick the right size?', a: 'Measure your head circumference and match the size chart.' },
    { q: 'Is this legal to ride with in India?', a: 'Yes — ISI certified, plus ECE 22.06 for international touring.' },
    { q: 'What is the return policy?', a: 'Unused helmets can be returned within 15 days of delivery.' },
  ];
  return <Accordion items={items} mode="single" />;
}

function BadgeDemo() {
  return (
    <Row>
      <Badge variant="soft" tone="accent" label="Soft" />
      <Badge variant="solid" tone="success" label="Solid" />
      <Badge variant="outline" tone="gold" label="Outline" />
      <Badge variant="dot" tone="danger" label="Live" pulse />
      <Badge variant="soft" tone="neutral" size="sm" label="Small" />
    </Row>
  );
}

function StatCardDemo() {
  return (
    <Row>
      <StatCard value={4.7} label="Average rating" delta="+0.2" trend="up" />
      <StatCard value={128} label="Verified reviews" delta="12 this week" trend="up" />
      <StatCard value={99.2} suffix="%" label="On-time delivery" delta="-0.4%" trend="down" />
    </Row>
  );
}

function RatingDemo() {
  const [value, setValue] = useState(3.5);
  return (
    <div className={styles.stack}>
      <Rating value={value} onChange={setValue} allowHalf />
      <Rating value={4} readOnly />
      <Rating value={3} icon="heart" readOnly />
      <Rating value={4} icon="circle" readOnly size="large" />
    </div>
  );
}

function QtyStepperDemo() {
  return (
    <Row>
      <QtyStepper variant="rounded" defaultValue={1} />
      <QtyStepper variant="pill" defaultValue={2} size="lg" />
      <QtyStepper variant="rounded" defaultValue={1} min={1} max={3} disabled />
    </Row>
  );
}

function SkeletonDemo() {
  return (
    <div className={styles.stack}>
      <Skeleton variant="text" lines={3} />
      <Row>
        <Skeleton circle width={48} />
        <Skeleton variant="card" width={140} height={90} />
      </Row>
    </div>
  );
}

function SpinnerDemo() {
  return (
    <Row>
      <Spinner size="small" />
      <Spinner size="medium" />
      <Spinner size="large" />
      <Spinner size={28} color="var(--success)" thickness={3} />
    </Row>
  );
}

function ProgressBarDemo() {
  return (
    <div className={styles.stack}>
      <ProgressBar value={62} showLabel />
      <ProgressBar value={30} tone="success" />
      <ProgressBar indeterminate tone="accent" />
    </div>
  );
}

function ToastDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Row>
      <Button variant="ghost" label="Show toast" onClick={() => setOpen(true)} />
      {open && (
        <Toast
          message="Added to cart"
          tone="success"
          open={open}
          onDismiss={() => setOpen(false)}
          action={{ label: 'View', onClick: () => setOpen(false) }}
        />
      )}
    </Row>
  );
}

function CarouselDemo() {
  const slides = ['front', 'three-quarter', 'side', 'back'].map((view) => (
    <div key={view} className={styles.carouselSlide}>
      {view}
    </div>
  ));
  return <Carousel items={slides} autoplay interval={3500} />;
}

function HoverZoomDemo() {
  return (
    <Row>
      <div className={styles.zoomWrap}>
        <HoverZoom mode="overlay" overlayContent={<span>Velocity RS Carbon</span>} />
      </div>
      <div className={styles.zoomWrap}>
        <HoverZoom mode="always" zoom={1.3} />
      </div>
    </Row>
  );
}

function CountUpDemo() {
  return (
    <Row>
      <CountUp value={4.7} decimals={1} />
      <CountUp value={12500} prefix="₹" />
      <CountUp value={98} suffix="%" easing="linear" />
    </Row>
  );
}

function MarqueeDemo() {
  const items = ['Free shipping over ₹5,000', 'ISI + ECE 22.06 certified', '5 year warranty', '15 day returns'];
  return (
    <div className={styles.stack}>
      <Marquee items={items} variant="solid" direction="left" />
      <Marquee items={items} variant="dark" direction="right" speed={30} />
    </div>
  );
}

function SelectDemo() {
  const [value, setValue] = useState('Featured');
  const options = ['Featured', 'Price low→high', 'Price high→low', 'Newest', 'Top rated'];
  return (
    <div className={styles.stack}>
      <Select label="Sort:" options={options} value={value} onChange={setValue} variant="minimal" />
      <Row>
        <Select options={options} variant="boxed" />
        <Select options={options} variant="pill" />
        <Select options={options} variant="solid" />
      </Row>
      <Select options={options} variant="underline" placement="up" />
    </div>
  );
}

function SegmentedToggleDemo() {
  const [density, setDensity] = useState('3 columns');
  const [tab, setTab] = useState('All');
  return (
    <div className={styles.stack}>
      <SegmentedToggle variant="grid-density" value={density} onChange={setDensity} aria-label="Grid density" />
      <SegmentedToggle variant="view-mode" shape="rounded" aria-label="View mode" />
      <SegmentedToggle variant="text" shape="pill" value={tab} onChange={setTab} aria-label="Product filter" />
    </div>
  );
}

function EmptyStateDemo() {
  return (
    <div className={styles.stack}>
      <EmptyState
        variant="dashed"
        title="No helmets match those filters"
        body="Try widening your price range or clearing a filter or two to see more of the range."
        ctaLabel="Clear all filters"
        secondaryLabel="Browse all"
      />
      <EmptyState
        variant="panel"
        align="left"
        tone="accent"
        icon={<Icon icon={Star} size="lg" />}
        kicker="WISHLIST"
        title="Nothing saved yet"
        body="Tap the heart on any helmet to keep it here."
        ctaLabel="Shop the range"
      />
    </div>
  );
}

function PromoTileDemo() {
  return (
    <div className={styles.stack}>
      <PromoTile
        variant="gradient"
        kicker="SHOWROOM EXCLUSIVE"
        headline="Trade in your old lid — get 15% off any track helmet."
        ctaLabel="Book a fitting"
        ctaHref="#"
      />
      <PromoTile variant="dark" layout="stack" kicker="NEW" headline="ECE 22.06 certified across the range." ctaLabel="Learn more" ctaHref="#" />
      <Row>
        <PromoTile variant="outline" headline="Free shipping over ₹5,000" ctaLabel="Shop" ctaHref="#" />
        <PromoTile variant="hatch" headline="5 year shell warranty" ctaLabel="Details" ctaHref="#" />
      </Row>
    </div>
  );
}

function FilterGroupDemo() {
  const brands = [
    { value: 'apex', label: 'APEX', count: 12 },
    { value: 'strata', label: 'STRATA', count: 9 },
    { value: 'nordvik', label: 'NORDVIK', count: 7 },
    { value: 'ioniq', label: 'IONIQ', count: 6 },
    { value: 'vanta', label: 'VANTA', count: 5 },
  ];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'].map((s) => ({ value: s.toLowerCase(), label: s }));
  const colours = [
    { value: 'black', label: 'Black', hex: '#14141a' },
    { value: 'white', label: 'White', hex: '#e8e8ea' },
    { value: 'red', label: 'Red', hex: '#c0392b' },
    { value: 'blue', label: 'Blue', hex: '#2e6bff' },
    { value: 'silver', label: 'Silver', hex: '#b8b8bd' },
  ];
  return (
    <Row>
      <FilterGroup title="BRAND" options={brands} collapsible />
      <FilterGroup title="TYPE" options={brands.slice(0, 4)} mode="single" variant="radio" searchable={false} />
      <FilterGroup title="SIZE" options={sizes} variant="pill" searchable={false} />
      <FilterGroup title="COLOUR" options={colours} variant="swatch" searchable={false} />
    </Row>
  );
}

function AppliedFilterBarDemo() {
  const chips = [
    { group: 'Brand', label: 'APEX' },
    { group: 'Brand', label: 'NORDVIK' },
    { group: 'Type', label: 'Track' },
    { group: 'Price', label: '≤ ₹60,000' },
  ];
  return (
    <div className={styles.stack}>
      <AppliedFilterBar chips={chips} showGroups countLabel="Showing 1–9 of 24 helmets" />
      <AppliedFilterBar chips={chips} variant="boxed" chipStyle="soft" />
    </div>
  );
}

const TRUST_DEMO = [
  { icon: <Icon icon={Truck} size="sm" />, title: 'Express delivery', sub: 'Next-day dispatch before 2pm' },
  { icon: <Icon icon={Undo2} size="sm" />, title: '15-day returns', sub: 'Unworn, tags attached' },
  { icon: <Icon icon={ShieldCheck} size="sm" />, title: 'Genuine warranty', sub: 'Covered by the brand' },
];

function SwatchPickerDemo() {
  const [i, setI] = useState(0);
  return (
    <SwatchPicker
      label="Colour"
      value={i}
      onChange={setI}
      items={[
        { name: 'Matte Black', hex: '#1a1a1c' },
        { name: 'Racing Red', hex: '#c0392b' },
        { name: 'Pearl White', hex: '#f4f3f1' },
        { name: 'Gunmetal Grey', hex: '#5a5d63' },
      ]}
    />
  );
}

function SizeGridDemo() {
  const [i, setI] = useState(2);
  return (
    <SizeGrid
      label="Size"
      value={i}
      onChange={setI}
      columns="auto"
      helper="Measure ~1cm above the eyebrows."
      onGuide={() => {}}
      items={[
        { label: 'XS', stock: 3 },
        { label: 'S', stock: 8 },
        { label: 'M', stock: 14 },
        { label: 'L', stock: 11 },
        { label: 'XL', stock: 2 },
        { label: 'XXL', stock: 0 },
      ]}
    />
  );
}

function StickyBuyBarDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.stack}>
      <Button variant="ghost" onClick={() => setVisible((v) => !v)}>
        {visible ? 'Hide sticky bar' : 'Show sticky bar'}
      </Button>
      <StickyBuyBar
        price="₹42,999"
        meta="Matte Black · Size M · Qty 1"
        label="Add to cart"
        visible={visible}
        desktop
        onAdd={() => {}}
      />
    </div>
  );
}

function SizeGuideSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.stack}>
      <Button variant="fill" onClick={() => setOpen(true)}>
        Open size guide
      </Button>
      <SizeGuideSheet
        open={open}
        onClose={() => setOpen(false)}
        highlight="M"
        columns={['Size', 'Head (cm)', 'Hat']}
        rows={[
          ['XS', '53–54', '6¾'],
          ['S', '55–56', '7'],
          ['M', '57–58', '7¼'],
          ['L', '59–60', '7½'],
          ['XL', '61–62', '7¾'],
          ['XXL', '63–64', '8'],
        ]}
      />
    </div>
  );
}

export default function ShowcasePage() {
  return (
    <div className={styles.page} id="top">
      <NavRail />
      <main className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>APEXLINE DESIGN SYSTEM</p>
            <h1 className={styles.title}>Primitives</h1>
            <p className={styles.subtitle}>
              Every primitive with its variants, states, and motion. Flip the accent to prove the
              CSS-variable theming reaches every component.
            </p>
          </div>
          <AccentSwitcher />
        </header>

        <Section id="buttons" title="Buttons">
          <Bay name="Button">
            <ButtonDemo />
          </Bay>
          <Bay name="ActionButton">
            <ActionButtonDemo />
          </Bay>
          <Bay name="SaveButton">
            <SaveButtonDemo />
          </Bay>
          <Bay name="Chip">
            <ChipDemo />
          </Bay>
        </Section>

        <Section id="cards" title="Cards">
          <Bay name="Card">
            <CardDemo />
          </Bay>
        </Section>

        <Section id="navigation" title="Navigation">
          <Bay name="Tabs">
            <TabsDemo />
          </Bay>
          <Bay name="Breadcrumbs">
            <BreadcrumbsDemo />
          </Bay>
          <Bay name="Pagination">
            <PaginationDemo />
          </Bay>
        </Section>

        <Section id="overlays" title="Overlays">
          <Bay name="Modal">
            <ModalDemo />
          </Bay>
          <Bay name="Tooltip">
            <TooltipDemo />
          </Bay>
          <Bay name="BottomSheet">
            <BottomSheetDemo />
          </Bay>
        </Section>

        <Section id="forms" title="Forms">
          <Bay name="TextInput">
            <TextInputDemo />
          </Bay>
          <Bay name="Toggle">
            <ToggleDemo />
          </Bay>
          <Bay name="Checkbox">
            <CheckboxDemo />
          </Bay>
          <Bay name="SearchBar">
            <SearchBarDemo />
          </Bay>
          <Bay name="ColorSwatch">
            <ColorSwatchDemo />
          </Bay>
          <Bay name="RangeSlider">
            <RangeSliderDemo />
          </Bay>
          <Bay name="Select">
            <SelectDemo />
          </Bay>
          <Bay name="SegmentedToggle">
            <SegmentedToggleDemo />
          </Bay>
        </Section>

        <Section id="data" title="Data display">
          <Bay name="Accordion">
            <AccordionDemo />
          </Bay>
          <Bay name="Badge">
            <BadgeDemo />
          </Bay>
          <Bay name="StatCard">
            <StatCardDemo />
          </Bay>
        </Section>

        <Section id="inputs" title="Inputs">
          <Bay name="Rating">
            <RatingDemo />
          </Bay>
          <Bay name="QtyStepper">
            <QtyStepperDemo />
          </Bay>
        </Section>

        <Section id="feedback" title="Feedback">
          <Bay name="Skeleton">
            <SkeletonDemo />
          </Bay>
          <Bay name="Spinner">
            <SpinnerDemo />
          </Bay>
          <Bay name="ProgressBar">
            <ProgressBarDemo />
          </Bay>
          <Bay name="Toast">
            <ToastDemo />
          </Bay>
          <Bay name="EmptyState">
            <EmptyStateDemo />
          </Bay>
        </Section>

        <Section id="media" title="Media">
          <Bay name="Carousel">
            <CarouselDemo />
          </Bay>
          <Bay name="HoverZoom">
            <HoverZoomDemo />
          </Bay>
        </Section>

        <Section id="motion" title="Motion">
          <Bay name="CountUp">
            <CountUpDemo />
          </Bay>
          <Bay name="Marquee">
            <MarqueeDemo />
          </Bay>
        </Section>

        <Section id="sections" title="Sections">
          <Bay name="PromoTile">
            <PromoTileDemo />
          </Bay>
        </Section>

        <Section id="filters" title="Filters">
          <Bay name="FilterGroup">
            <FilterGroupDemo />
          </Bay>
          <Bay name="AppliedFilterBar">
            <AppliedFilterBarDemo />
          </Bay>
        </Section>

        <Section id="pdp" title="PDP">
          <Bay name="ProductGallery">
            <div style={{ maxWidth: 380 }}>
              <ProductGallery
                views={['Front', 'Side', '3/4 Angle', 'Back', 'Interior']}
                tag="MATTE BLACK"
                badge="NEW"
                safety="ECE 22.06"
                lightbox
              />
            </div>
          </Bay>
          <Bay name="SwatchPicker">
            <SwatchPickerDemo />
          </Bay>
          <Bay name="SizeGrid">
            <SizeGridDemo />
          </Bay>
          <Bay name="SpecTable">
            <SpecTable
              items={[
                { label: 'Shell material', value: 'Carbon fibre composite' },
                { label: 'Weight', value: '1,350g ± 50g (size M)' },
                { label: 'Certification', value: 'ISI, ECE 22.06' },
                { label: 'Retention', value: 'Double-D ring' },
              ]}
            />
          </Bay>
          <Bay name="TrustList">
            <div style={{ display: 'grid', gap: 20 }}>
              <TrustList items={TRUST_DEMO} layout="stack" />
              <TrustList items={TRUST_DEMO} layout="row" />
            </div>
          </Bay>
          <Bay name="ReviewSummary">
            <ReviewSummary
              score={4.7}
              count={212}
              distribution={[
                { n: 5, count: 186 },
                { n: 4, count: 18 },
                { n: 3, count: 5 },
                { n: 2, count: 2 },
                { n: 1, count: 1 },
              ]}
            />
          </Bay>
          <Bay name="ProductReview">
            <ProductReview
              author="James T."
              date="12 Jun 2026"
              rating={5}
              title="Best track helmet I've owned"
              body="Lightweight, incredible ventilation, and the visor clarity is unmatched."
              meta="Size L · Matte Black"
            />
            <ProductReview
              author="David K."
              date="14 May 2026"
              rating={4}
              title="Almost perfect"
              body="Fit and finish are superb; only wish the visor mechanism was a touch smoother."
              verified={false}
            />
          </Bay>
          <Bay name="StickyBuyBar">
            <StickyBuyBarDemo />
          </Bay>
          <Bay name="SizeGuideSheet">
            <SizeGuideSheetDemo />
          </Bay>
        </Section>
      </main>
    </div>
  );
}
