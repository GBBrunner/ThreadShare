import fs from 'fs';
import path from 'path';
import ImageCarousel from "./components/ImageCarousel";
import ThemedLogo from "./components/ThemedLogo";

export default function Home() {
  const carouselDir = path.join(process.cwd(), 'public', 'img-carousel');
  const images = fs.readdirSync(carouselDir).map(file => `/img-carousel/${file}`);

  return (
    <>
    <main className="bg-2 all-pages-style flex flex-col h-screen">
      <div className="py-12 border-b-4 all-pages-style flex justify-center items-center">
        <ThemedLogo />
        <div className="introTestWrap h-26 bg-content-1 flex justify-center items-center py-6 px-60 rounded-lg">
          <h1 className="introTextBox text-4xl text-white font-bold pb-3 text-center">ThreadShare</h1>

          </div>
      </div>
      <ImageCarousel images={images} />
      <div className="flex flex-col items-center all-pages-style theme-gradient">
      </div>
    </main>
    </>
  )
}
