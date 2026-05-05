import {useTheme} from "@/app/hooks/useTheme";
import { SiNextdotjs } from "react-icons/si";
import StackCard, { StackCardAccent } from "./StackCard"
import Image from "next/image";

export default function ProjectStack() {
    const theme = useTheme();
    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10 px-6 max-w-6xl all-pages-style mx-auto">
        {/* Card 1: Client */}
        <StackCard title="Client" accent="blue"
        icons={[
        <>
        <div className="relative w-full max-w-36 h-12 hidden lg:block">
            <Image src='/next.svg' alt="Next.js" fill className={`object-contain ${theme === 'dark' ? 'invert' : ''}`} />
        </div>
        <SiNextdotjs className={`block lg:hidden text-6xl ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
        </>,
        <>
        <div className="relative w-full max-w-36 h-12 hidden lg:block">
            <Image src='/vercel_logo.svg' alt="Vercel" fill className={`object-contain ${theme === 'dark' ? 'invert' : ''}`} />
        </div>
        <Image src='/vercel_icon.svg' alt="Vercel" width={36} height={36} className={`block lg:hidden ${theme === 'light' ? 'invert' : ''}`} />
        </>,
        ]}
        >
            <p>Built with <StackCardAccent>Next.js</StackCardAccent> and deployed on <StackCardAccent>Vercel</StackCardAccent>.</p>
            <p>Session state is managed via React Context and persisted in localStorage for a seamless user experience.</p>
            <p>ProtectedRoute components guard authenticated pages, with Bearer tokens automatically attached to API requests.</p>
            </StackCard>
          {/* Card 2: Database */}
          <StackCard title="Database" accent="emerald"
            icons={[
              <>
                <div className="relative w-full max-w-40 h-12 hidden lg:block">
                  <Image src={theme === 'dark' ? '/supabase-logo-wordmark--dark.svg' : '/supabase-logo-wordmark--light.svg'} alt="Supabase" fill className="object-contain" />
                </div>
                <Image src='/supabase_icon.svg' alt="Supabase" width={36} height={36} className="block lg:hidden" />
              </>,
              <>
                <div className="relative w-full max-w-40 h-12 hidden lg:block">
                  <Image src={theme === 'dark' ? '/PostgreSQL-dark.svg' : '/PostgreSQL-light.svg'} alt="PostgreSQL" fill className="object-contain" />
                </div>
                <Image src='/postgresql-icon.svg' alt="PostgreSQL" width={36} height={36} className="block lg:hidden" />
              </>,
            ]}
          >
            <p><StackCardAccent>PostgreSQL</StackCardAccent> hosted on <StackCardAccent>Supabase</StackCardAccent>, accessed through a high-performance connection pool.</p>
            <p>Security first: Passwords are hashed with bcrypt at signup and rigorously verified during the login process.</p>
            <p>Fully managed infrastructure ensures reliability, scalability, and automated backups for all student data.</p>
          </StackCard>

          {/* Card 3: Server */}
          <StackCard title="Server" accent="indigo"
            icons={[
              <Image src='/expressjs.svg' alt="Express.js" width={60} height={60} className={`lg:w-15 lg:h-15 w-10 h-10 ${theme === 'dark' ? 'invert' : ''}`} />,
              <>
                <div className="relative w-full max-w-44 h-14 hidden lg:block">
                  <Image src='/RenderLogo.svg' alt="Render" fill className={`object-contain ${theme === 'light' ? 'invert' : ''}`} />
                </div>
                <Image src='/Render-icon.svg' alt="Render" width={40} height={40} className={`block lg:hidden ${theme === 'light' ? 'invert' : ''}`} />
              </>,
            ]}
          >
            <p><StackCardAccent>Express.js</StackCardAccent> REST API deployed on <StackCardAccent>Render</StackCardAccent> for reliable backend services.</p>
            <p>Robust routes handle everything from complex enrollment logic to secure student data management.</p>
            <p>JWT-based middleware verifies identity, while CORS is strictly configured to protect our API endpoints.</p>
          </StackCard>
        </div>
    )
}