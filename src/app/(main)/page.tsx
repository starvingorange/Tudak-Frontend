import { HeroSection } from "@/features/main/hero-section";
import { PopularVotesSection } from "@/features/main/popular-votes-section";
import { WaitingRoomsSection } from "@/features/main/waiting-rooms-section";

export default function Home() {
  return (
    <div className="mx-auto max-w-241 px-3 pt-4 pb-8 sm:px-4 sm:pt-6">
      <HeroSection />
      <PopularVotesSection />
      <WaitingRoomsSection />
    </div>
  );
}
