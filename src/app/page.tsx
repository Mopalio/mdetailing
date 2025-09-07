import { Hero } from '@/sections/Hero';
import { Pricing } from '@/sections/Pricing';
import { Gallery } from '@/sections/Gallery';
import { Team } from '@/sections/Team';
import { Rewards } from '@/sections/Rewards';
import { Appointment } from '@/sections/Appointment';

export default function Home() {
  const heroData = {
    title: "MDetailing",
    subtitle: "Experience the finest car washing service with our state-of-the-art equipment and eco-friendly products. Your car deserves the best care.",
    ctaText: "Book Now",
    ctaLink: "#appointment",
    imageUrl: "/images/hero_main.webp" // Placeholder image
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
    title: "Our Work",
    subtitle: "See the amazing results our professional car washing service delivers. Every vehicle leaves our facility looking its absolute best.",
    images: [
      {
        id: "1",
        src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        alt: "Clean sedan after wash",
        title: "Sedan Wash",
        description: "Complete exterior and interior cleaning"
      },
      {
        id: "2",
        src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop&crop=center",
        alt: "SUV after professional wash",
        title: "SUV Detail",
        description: "Premium wash with wax protection"
      },
      {
        id: "3",
        src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop&crop=center",
        alt: "Luxury car after wash",
        title: "Luxury Car Care",
        description: "Premium detailing service"
      },
      {
        id: "4",
        src: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop&crop=center",
        alt: "Truck after wash",
        title: "Truck Wash",
        description: "Complete truck cleaning service"
      },
      {
        id: "5",
        src: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop&crop=center",
        alt: "Van after wash",
        title: "Van Detail",
        description: "Professional van cleaning"
      },
      {
        id: "6",
        src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        alt: "Sports car after wash",
        title: "Sports Car Care",
        description: "Specialized sports car cleaning"
      }
    ]
  };

  const teamData = {
    title: "Meet Our Team",
    subtitle: "Our experienced professionals are dedicated to providing the best car washing service in the area.",
    members: [
      {
        id: "1",
        name: "Mike Johnson",
        position: "Lead Car Detailer",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
        description: "Mike has over 8 years of experience in professional car detailing and specializes in luxury vehicle care.",
        experience: "8+ years",
        specialties: ["Luxury Cars", "Paint Protection", "Interior Detailing"]
      },
      {
        id: "2",
        name: "Sarah Martinez",
        position: "Senior Car Washer",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop&crop=face",
        description: "Sarah is our go-to expert for exterior washing and tire care with a keen eye for detail.",
        experience: "6+ years",
        specialties: ["Exterior Washing", "Tire Care", "Wax Application"]
      },
      {
        id: "3",
        name: "David Chen",
        position: "Equipment Specialist",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face",
        description: "David ensures all our equipment runs perfectly and maintains our high-quality standards.",
        experience: "10+ years",
        specialties: ["Equipment Maintenance", "Quality Control", "Training"]
      },
      {
        id: "4",
        name: "Emily Rodriguez",
        position: "Customer Service Manager",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop&crop=face",
        description: "Emily handles all customer inquiries and ensures every client has an exceptional experience.",
        experience: "5+ years",
        specialties: ["Customer Service", "Appointment Scheduling", "Client Relations"]
      },
      {
        id: "5",
        name: "Alex Thompson",
        position: "Detail Specialist",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face",
        description: "Alex specializes in deep cleaning and restoration work for heavily soiled vehicles.",
        experience: "7+ years",
        specialties: ["Deep Cleaning", "Restoration", "Stain Removal"]
      },
      {
        id: "6",
        name: "Lisa Park",
        position: "Quality Assurance",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&crop=face",
        description: "Lisa performs final inspections to ensure every vehicle meets our high standards.",
        experience: "9+ years",
        specialties: ["Quality Inspection", "Final Touches", "Standards Compliance"]
      }
    ]
  };

  const rewardsData = {
    title: "Loyalty Rewards Program",
    subtitle: "Earn rewards with every wash and get a free car wash after 10 visits!",
    currentWashes: 7, // Example: customer has completed 7 washes
    tiers: [
      {
        id: "1",
        washes: 5,
        reward: "Free Interior Detail",
        description: "Get a complimentary interior detailing service",
        icon: "🧽",
        color: "bg-accent/10"
      },
      {
        id: "2",
        washes: 10,
        reward: "Free Car Wash",
        description: "Enjoy a complete car wash on us",
        icon: "🎁",
        color: "bg-success/10"
      },
      {
        id: "3",
        washes: 20,
        reward: "Premium Detail Package",
        description: "Full premium detailing service for free",
        icon: "⭐",
        color: "bg-warning/10"
      }
    ]
  };

  const appointmentData = {
    title: "Book Your Appointment",
    subtitle: "Schedule your car wash today and experience the difference our professional service makes."
  };

  return (
    <main className="pt-16">
      <div id="home">
        <Hero {...heroData} />
      </div>
      <div id="pricing">
        <Pricing {...pricingData} />
      </div>
      <div id="gallery">
        <Gallery {...galleryData} />
      </div>
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
