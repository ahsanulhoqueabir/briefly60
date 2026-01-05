import { Article } from "@/types/news.types";
import Marquee from "react-fast-marquee";
interface NewsTickerProps {
  articles: Article[];
}
const Headlines = ({ articles }: NewsTickerProps) => {
  return (
    <Marquee
      pauseOnHover={true}
      gradient={true}
      gradientWidth={100}
      gradientColor={"#F7F9F2"}
      speed={30}
      className="bg-pride h-12 "
    >
      {articles.map((article) => (
        <Headline key={article.id} news={article} />
      ))}
    </Marquee>
  );
};

export default Headlines;

const Headline = ({ news }: { news: Article }) => {
  return <h1 className="px-4"> -- {news.title} --</h1>;
};
