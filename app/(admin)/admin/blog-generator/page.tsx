import ChatToPublishClient from "@/components/admin/ChatToPublishClient";

export const metadata = {
  title: "AI Blog Publisher",
};

interface BlogGeneratorPageProps {
  searchParams?: {
    embedded?: string;
  };
}

export default function BlogGeneratorPage({
  searchParams,
}: BlogGeneratorPageProps) {
  return (
    <ChatToPublishClient embedded={searchParams?.embedded === "1"} />
  );
}
