import { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { ACCENTS, ACCENT_KEYS } from '../theme/accents';
import { useCart } from '../cart/CartContext';
import {
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
} from '../components/primitives';
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
    items: ['TextInput', 'Toggle', 'Checkbox', 'SearchBar', 'ColorSwatch', 'RangeSlider'],
  },
  { id: 'data', label: 'Data display', items: ['Accordion', 'Badge', 'StatCard'] },
  { id: 'inputs', label: 'Inputs', items: ['Rating', 'QtyStepper'] },
  { id: 'feedback', label: 'Feedback', items: ['Skeleton', 'Spinner', 'ProgressBar', 'Toast'] },
  { id: 'media', label: 'Media', items: ['Carousel', 'HoverZoom'] },
  { id: 'motion', label: 'Motion', items: ['CountUp', 'Marquee'] },
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
        ★
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
      </main>
    </div>
  );
}
