import { getSettings } from "@/lib/sanity/client";
// import Footer from "@/components/footer"; // Keep your existing Footer for now or decide which one to use
import { urlForImage } from "@/lib/sanity/image";
// import Navbar from "@/components/navbar"; // Remove import for old Navbar
import Header from "@/components/Header"; // Import the new Header
// import NewsletterForm from "@/components/NewsletterForm"; // Added NewsletterForm import
import { Github, Instagram, Linkedin, Youtube, /* Check Lucide for TikTok icon name, using a placeholder for now */ Users } from 'lucide-react'; // Users as placeholder for TikTok
import Image from "next/image"; // Import Next.js Image component

// Helper for social media icons (Heroicons - outline style)
const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> {/* Placeholder - will replace with actual GitHub icon path */}
    {/* Actual GitHub Icon Path (example - you might need to adjust based on Heroicons version or copy directly) */}
    {/* <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9.75L10.5 15.75 7.5 12.75" /> */}
    {/* Using a more distinct icon for GitHub for now, will refine if actual path isn't readily available */}
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zm-.75 5.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm3 0a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5z" />
  </svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zm0 3a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zm0 1.5a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5zm5.625-2.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
  </svg>
);
const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zM8.25 9.75h1.5v6H8.25v-6zm1.875-1.125a.938.938 0 11-1.876 0 .938.938 0 011.876 0zm3.375 1.125h1.5v2.625c0 .825.225 1.5.75 1.5s.75-.675.75-1.5v-2.625H18v2.813c0 1.65-1.125 2.437-2.25 2.437s-1.5-.788-1.5-2.437V9.75z" />
    </svg>
);
const YouTubeIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zM9.75 8.25l6 3.75-6 3.75V8.25z" />
</svg>
);
const TikTokIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V11.25c0 1.243.092 2.45.263 3.617.193 1.325.72 2.528 1.596 3.404.877.876 2.08 1.403 3.405 1.596C15.55 19.908 16.757 20 18 20V18c-1.11 0-2.136-.08-3.093-.238-.84-.138-1.508-.51-1.99-1.005-.49-.49-.867-1.15-.99-1.99C11.82 13.864 11.75 12.89 11.75 11.75V6.75m3-3v8.25c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75M9 3.75h3" />
</svg>
);


const socialLinks = [
  { name: 'GitHub', href: '#YOUR_GITHUB_URL', icon: Github },
  { name: 'Instagram', href: '#YOUR_INSTAGRAM_URL', icon: Instagram },
  { name: 'LinkedIn', href: '#YOUR_LINKEDIN_URL', icon: Linkedin },
  { name: 'YouTube', href: '#YOUR_YOUTUBE_URL', icon: Youtube },
  { name: 'TikTok', href: '#YOUR_TIKTOK_URL', icon: Users }, // Using Users as a placeholder for TikTok, replace with actual if available or a generic link icon
];

const NewFooter = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <a href="/" className="flex items-center">
              {/* Using Next.js Image component for optimized image loading */}
              <Image src="/logo.png" alt="QybrrLabs Logo" height={48} width={200} /> {/* Increased logo size to h-12 and added width/height for Next.js Image */}
              {/* <span className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">QybrrLabs</span> */}
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-5">
            {socialLinks.map((item) => (
              <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <span className="sr-only">{item.name}</span>
                <item.icon className="w-6 h-6" /> {/* Added className for sizing Lucide icons */}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} QybrrLabs. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

async function sharedMetaData(params) {
  const settings = await getSettings();

  return {
    // enable this for resolving opengraph image
    // metadataBase: new URL(settings.url),
    title: {
      default: settings?.title || "QybrrLabs - Blog",
      template: "%s | QybrrLabs"
    },
    description:
      settings?.description ||
      "QybrrLabs - Blog powered by Next.js and Sanity",
    keywords: ["Next.js", "Sanity", "Tailwind CSS", "QybrrLabs"],
    authors: [{ name: "Surjith" }],
    canonical: settings?.url,
    openGraph: {
      images: [
        {
          url:
            urlForImage(settings?.openGraphImage)?.src ||
            "/img/opengraph.jpg",
          width: 800,
          height: 600
        }
      ]
    },
    twitter: {
      title: settings?.title || "QybrrLabs",
      card: "summary_large_image"
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export async function generateMetadata({ params }) {
  return await sharedMetaData(params);
}

export default async function Layout({ children, params }) {
  const settings = await getSettings(); // Keep settings if needed by other parts or the original Footer
  return (
    <>
      {/* Use the new Header component */}
      <Header />

      {/* Removed the mt-2 class from here, can be added to main content area if needed */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main> {/* Added some padding to main for better spacing before newsletter/footer */}

      {/* Newsletter Form added here */}
      {/* <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewsletterForm />
      </div> */}

      {/* Use the new Footer component */}
      {/* If your original Footer used settings, you might need to adapt the new one or keep the old one */}
      <NewFooter />
    </>
  );
}
// enable revalidate for all pages in this layout
// export const revalidate = 60;
