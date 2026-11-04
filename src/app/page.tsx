import { Hero } from '@/sections/Hero';
import { Pricing } from '@/sections/Pricing';
import { Gallery } from '@/sections/Gallery';
import { Appointment } from '@/sections/Appointment';

export default function Home() {
  const heroData = {
    eyebrow: "Luxembourg · Mobile detailing",
    title: "Your car has never been this",
    titleAccent: "clean",
    subtitle:
      "Paint correction, ceramic coating and deep interior work, done at your door. No queue, no tunnel brushes, no swirl marks.",
    ctaText: "Book a slot",
    ctaLink: "#appointment",
    secondaryCtaText: "View pricing",
    secondaryCtaLink: "#pricing",
    imageUrl: "/images/hero_main.webp"
  };

  const pricingData = {
    title: "Our Pricing",
    subtitle: "Choose the perfect wash package for your vehicle. All packages include our premium cleaning products and attention to detail.",
    tiers: [
      {
        id: "1",
        name: "Small Car",
        price: 50,
        description: "Perfect for compact cars and sedans",
        features: [
          "Exterior wash and rinse",
          "Tire and wheel cleaning",
          "Window cleaning",
          "Interior vacuum",
          "Dashboard wipe down"
        ]
      },
      {
        id: "2",
        name: "Medium Car",
        price: 65,
        description: "Ideal for SUVs and mid-size vehicles",
        features: [
          "Everything in Small Car",
          "Extended interior cleaning",
          "Tire dressing",
          "Air freshener",
          "Premium wax protection"
        ],
        popular: true
      },
      {
        id: "3",
        name: "Large Car",
        price: 80,
        description: "For trucks, vans, and large SUVs",
        features: [
          "Everything in Medium Car",
          "Deep interior cleaning",
          "Leather conditioning",
          "Paint protection",
          "Premium detailing"
        ]
      }
    ]
  };

  const galleryData = {
    title: "Before, and after.",
    subtitle:
      "Every pair is the same vehicle twice. Drag the divider to see what comes off."
  };

  const appointmentData = {
    title: "Let's get it filthy clean.",
    subtitle:
      "Tell us the car and the postcode. We confirm a slot the same day."
  };

  return (
    <main>
      <div id="home">
        <Hero {...heroData} />
      </div>
      <Pricing {...pricingData} />
      <Gallery {...galleryData} />
      {/* <div id="team">
        <Team {...teamData} />
      </div>
      <div id="rewards">
        <Rewards {...rewardsData} />
      </div> */}
      <div id="appointment">
        <Appointment {...appointmentData} />
      </div>
    </main>
  );
}
