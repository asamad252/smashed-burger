import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F1E5A1]">
      <Navbar />

      <Hero />

      <Footer />
    </main>
  );
}