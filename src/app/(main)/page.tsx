import { HeroSection } from "@/features/main/hero-section";
import { PopularVotesSection } from "@/features/main/popular-votes-section";
import { WaitingRoomsSection } from "@/features/main/waiting-rooms-section";

export default function Home() {
  return (
    <div className="max-w-241 mx-auto px-2 pt-6">
      <HeroSection />
      <PopularVotesSection />
      <WaitingRoomsSection />
    </div>
  );
}
