import React from 'react';
import Header from '../components/why-us/Header';
import Hero from '../components/why-us/Hero';
import FeatureCardsRow from '../components/why-us/FeatureCardsRow';
import StatsStrip from '../components/why-us/StatsStrip';
import ContentSection from '../components/why-us/ContentSection';
import Carousel from '../components/why-us/Carousel';
import FAQ from '../components/why-us/FAQ';
import CTA from '../components/why-us/CTA';
import Footer from '../components/why-us/Footer';

const WhyUsPage = () => {
  // Carousel items data
  const carouselItems = [
    [
      {
        category: 'Horatio Insights',
        title: 'Horatio Hosts Successful Third Annual Client Summit',
        date: 'Mar 10 2025',
        description:
          'Horatio, the modern outsourcing company revolutionizing CX services and the BPO industry, hosted its third annual Client Summit in Santo Domingo.',
        link: '#',
      },
      {
        category: 'Horatio Insights',
        title: 'Horatio Honored As Dual Gold and Bronze Winner',
        date: 'Apr 28 2025',
        description:
          'Horatio has been named one of 2025 STEVIE® award winners in the 23rd annual American Business Awards.',
        link: '#',
      },
      {
        category: 'Horatio Insights',
        title: 'Inc. Names Horatio #27 on Fastest-Growing List',
        date: 'Apr 01 2025',
        description:
          'Inc. revealed that Horatio has been ranked No. 27 on its 2025 List of the Fastest-Growing Private Companies in the Northeast.',
        link: '#',
      },
    ],
    [
      {
        category: 'Horatio Insights',
        title: 'New Partnership Announcement',
        date: 'May 15 2025',
        description:
          'Horatio announces strategic partnership to expand services and reach new markets.',
        link: '#',
      },
      {
        category: 'Horatio Insights',
        title: 'Industry Recognition',
        date: 'Jun 01 2025',
        description:
          'Horatio receives industry recognition for excellence in customer service outsourcing.',
        link: '#',
      },
      {
        category: 'Horatio Insights',
        title: 'Expansion News',
        date: 'Jun 20 2025',
        description:
          'Horatio expands operations to serve more clients with dedicated teams and resources.',
        link: '#',
      },
    ],
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <FeatureCardsRow />
        <StatsStrip />
        
        <ContentSection
          eyebrow="Our Story"
          title="Born to Help Businesses Scale"
          description="Horatio was born to help brand-focused, high-touch, innovative businesses turn customer interactions into revenue-generating opportunities."
          features={[
            'Next-generation business process outsourcing',
            'Personalized solutions that redefine processes',
            'Trusted partner of fastest growing companies',
          ]}
          image="/assets/section-1.jpg"
          imageAlt="Our story"
          reverse={false}
        />

        <ContentSection
          eyebrow="Results"
          title="Powered by People"
          description="Our dedicated team of professionals is at the heart of everything we do. We invest heavily in their professional growth and personal wellbeing."
          features={[
            'Complete operations organization included',
            'Trainers, CSMs, and QA analysts',
            'Scalable teams that grow with you',
          ]}
          image="/assets/section-2.jpg"
          imageAlt="Results powered by people"
          reverse={true}
        />

        <ContentSection
          eyebrow="Locations"
          title="Global Presence, Local Expertise"
          description="With offices in the Dominican Republic, Colombia, and Miami, we provide 24/7 support with teams that understand your market."
          features={[
            'Santo Domingo: 2,200 seats, 130,000 sq. ft',
            'Santiago: 500 seats, specialized talent',
            'Bogotá, Colombia: Growing presence',
            'Miami, FL: Strategic headquarters',
          ]}
          image="/assets/section-3.jpg"
          imageAlt="Our locations"
          reverse={false}
        />

        <Carousel items={carouselItems} />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default WhyUsPage;

