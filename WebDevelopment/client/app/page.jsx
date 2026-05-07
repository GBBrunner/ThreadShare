import ThemedLogo from "./components/ThemedLogo";

export default function Home() {
  return (
    <>
      <main className="bg-2 all-pages-style flex flex-col h-screen">
        <div className="py-12 border-b-4 all-pages-style flex justify-center items-center">
          <ThemedLogo />
        </div>
        <div className="flex flex-col items-center all-pages-style theme-gradient"></div>
      </main>
    </>
  );
}
