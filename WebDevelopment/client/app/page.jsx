import ThemedLogo from "./components/ThemedLogo";

export default function Home() {
  return (
    <main className="bg-2 all-pages-style flex flex-col h-screen">
      <div className="py-12 border-b-4 all-pages-style flex justify-center items-center">
        <ThemedLogo />
        <div className="introTestWrap h-26 bg-content-1 flex justify-center items-center py-6 px-60 rounded-lg">
          <h1 className="introTextBox text-4xl text-white font-bold pb-3 text-center">ThreadShare</h1>
        </div>
      </div>
      <div className="flex flex-col items-center all-pages-style theme-gradient">
      </div>
    </main>
  )
}
