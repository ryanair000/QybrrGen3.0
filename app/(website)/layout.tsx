import { getSettings } from "@/lib/sanity/client";
// import Footer from "@/components/footer"; // Keep your existing Footer for now or decide which one to use
import { urlForImage } from "@/lib/sanity/image";
// import Navbar from "@/components/navbar"; // Remove import for old Navbar
import Header from "@/components/Header"; // Import the new Header
import Footer from "@/components/Footer"; // Import the new Footer

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
      <main>{children}</main>

      {/* Use the new Footer component */}
      {/* If your original Footer used settings, you might need to adapt the new one or keep the old one */}
      <Footer />
    </>
  );
}
// enable revalidate for all pages in this layout
// export const revalidate = 60;
