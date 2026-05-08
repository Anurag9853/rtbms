import { ScrollProgressBar } from '../components/ui/ScrollProgressBar';
import { HeroSection }           from '../components/landing/HeroSection';
import { FeaturesSection }       from '../components/landing/FeaturesSection';
import { BloodAvailabilityPreview } from '../components/landing/BloodAvailabilityPreview';
import { HowItWorksSection }     from '../components/landing/HowItWorksSection';
import { LiveMapPreview }        from '../components/landing/LiveMapPreview';
import { AnalyticsPreview }      from '../components/landing/AnalyticsPreview';
import { AIChatbotShowcase }     from '../components/landing/AIChatbotShowcase';
import { SocialProofSection }    from '../components/landing/SocialProofSection';
import { CampaignsSection }      from '../components/landing/CampaignsSection';
import { CTAFooter }             from '../components/landing/CTAFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-base-900 dark">
      {/* Fixed scroll progress indicator */}
      <ScrollProgressBar />

      {/* Page Sections */}
      <HeroSection />
      <FeaturesSection />
      <BloodAvailabilityPreview />
      <HowItWorksSection />
      <LiveMapPreview />
      <AnalyticsPreview />
      <AIChatbotShowcase />
      <SocialProofSection />
      <CampaignsSection />
      <CTAFooter />
    </div>
  );
}
