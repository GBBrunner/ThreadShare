export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-200 py-10 mt-20 border-t-4 border-black">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-8">
        
        {/* Left Section */}
        <div className="max-w-md">
          <h2 className="text-xl font-semibold">Woodland Community College</h2>
          <p className="mt-3 text-sm text-gray-400">
            A place where students thrive, discover their potential, and feel at home among
            tree‑lined paths and inspiring learning spaces.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-gray-300">Explore</h3>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition">Programs</a>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition">Admissions</a>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition">Campus Life</a>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition">Support Services</a>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-gray-300">Contact</h3>
          <p className="text-sm text-gray-400">123 Woodland Way</p>
          <p className="text-sm text-gray-400">Forestview, CA 99999</p>
          <p className="text-sm text-gray-400">info@woodlandcc.edu</p>
        </div>
      </div>
    </footer>
  );
}