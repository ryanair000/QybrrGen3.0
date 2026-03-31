import { ArticleCard, ArticleCardProps } from "@/components/ui/card-23";

const ArticleCardDemo = () => {
  const cardData: ArticleCardProps = {
    tag: "Lush and green",
    date: {
      month: "JAN",
      day: 25,
    },
    title: "Discovering Peace",
    description:
      "Far from the city's noise, the green mountains stretch endlessly into the horizon, blanketed with mist and silence.",
    imageUrl:
      "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1932&auto=format&fit=crop",
    imageAlt: "A lush green hill with a beautiful contour.",
    location: {
      city: "Blue Ridge",
      country: "Virginia, USA",
    },
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <ArticleCard {...cardData} />
    </div>
  );
};

export default ArticleCardDemo;
