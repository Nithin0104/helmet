import { BrandStrip, ProductRail } from '../../components/composite';
import { PRODUCTS, getBestsellers, getNewArrivals } from '../../data/products';
import { ACCESSORIES } from '../../data/accessories';
import { CARE } from '../../data/care';
import { HomeHero } from './sections/HomeHero';
import { CategoryStrip } from './sections/CategoryStrip';
import { WhyUs } from './sections/WhyUs';
import { CompareBand } from './sections/CompareBand';
import { ShowroomCta } from './sections/ShowroomCta';
import { ReviewsMarquee } from './sections/ReviewsMarquee';
import { Reveal } from './sections/Reveal';
import styles from './HomePage.module.css';

const helmetTabs = [
  { id: 'best', label: 'Bestsellers', items: getBestsellers(PRODUCTS) },
  { id: 'new', label: 'New Arrivals', items: getNewArrivals(PRODUCTS) },
];

const accessoryTabs = [
  { id: 'best', label: 'Bestsellers', items: getBestsellers(ACCESSORIES) },
  { id: 'new', label: 'New Arrivals', items: getNewArrivals(ACCESSORIES) },
];

/** Store home page — DC "Helmet Showroom Home" ported onto real composites/data. */
export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <HomeHero />
      <BrandStrip />
      <Reveal>
        <CategoryStrip />
      </Reveal>
      <Reveal>
        <ProductRail
          sectionId="helmets"
          title="Helmets"
          tabs={helmetTabs}
          seeAllHref="/shop"
          layout="grid"
          limit={5}
        />
      </Reveal>
      <Reveal>
        <ProductRail
          sectionId="accessories"
          title="Accessories"
          tabs={accessoryTabs}
          seeAllHref="/shop"
          layout="grid"
          limit={5}
        />
      </Reveal>
      <Reveal>
        <ProductRail
          sectionId="care"
          title="Care"
          items={CARE}
          seeAllHref="/shop"
          layout="grid"
          limit={5}
        />
      </Reveal>
      <Reveal>
        <WhyUs />
      </Reveal>
      <Reveal>
        <CompareBand />
      </Reveal>
      <Reveal>
        <ShowroomCta />
      </Reveal>
      <Reveal>
        <ReviewsMarquee />
      </Reveal>
    </div>
  );
}
