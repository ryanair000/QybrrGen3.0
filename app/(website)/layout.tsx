import React from 'react';
import { getSettings } from "@/lib/sanity/client";
// import Footer from "@/components/footer"; // Keep your existing Footer for now or decide which one to use
import { urlForImage } from "@/lib/sanity/image";
// import Navbar from "@/components/navbar"; // Remove import for old Navbar
import Header from "@/components/Header"; // Import the new Header
// import NewsletterForm from "@/components/NewsletterForm"; // Added NewsletterForm import
import { Github, Instagram, Linkedin, Youtube, /* Check Lucide for TikTok icon name, using a placeholder for now */ Users } from 'lucide-react'; // Users as placeholder for TikTok
import Image from "next/image"; // Import Next.js Image component

// Helper for social media icons (Heroicons - outline style)



const socialLinks = [
  { name: 'GitHub', href: '#', icon: Github },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
  { name: 'YouTube', href: '#', icon: Youtube },
  { name: 'TikTok', href: '#', icon: Users }, // Using Users as a placeholder
];

const footerNav = [
  { name: 'About', href: '/about' },
  { name: 'Products', href: '/products' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const NewFooter = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/">
                <Image src="/logo.png" alt="QybrrLabs Logo" height={40} width={160} />
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} QybrrLabs. All rights reserved.</p>
          </div>

          {/* Navigation Links */}
          <div className="flex justify-center">
            <ul className="flex space-x-6 md:space-x-8">
              {footerNav.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-600 hover:text-purple-700 dark:text-gray-300 dark:hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center md:justify-end">
            <div className="flex space-x-5">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-purple-700 dark:hover:text-white transition-colors">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
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
      default: settings?.title || "QybrrLabs Home",
      template: "%s | QybrrLabs"
    },
    description:
      settings?.description ||
      "QybrrLabs Home powered by Next.js and Sanity",
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
