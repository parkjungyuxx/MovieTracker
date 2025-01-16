import { useEffect, useMemo, useRef, useState } from "react";
import MovieApi from "./apis/movie/movieApi";
import "./App.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import styled from "@emotion/styled";

function App() {
  const lastMovieItemRef = useRef(null);

  const menuList = [
    { title: "현재 상영작", path: "now_playing" },
    { title: "인기 영화", path: "popular" },
    { title: "평점 높은 영화", path: "top_rated" },
    { title: "개봉 예정작", path: "upcoming" },
  ];

  const [category, setCategory] = useState("upcoming");

  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["movieList", category],
    queryFn: ({ pageParam = 1 }) =>
      MovieApi.getUpComingMovieList({ category: category, page: pageParam }),
    getNextPageParam: (lastPage, allPage) => lastPage + 1,
    // allPage.length > lastPage.totalPage && lastPage.page + 1,
  });

  const movieList = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.results);
  }, [data]);

  useEffect(
    function onObserve() {
      const el = lastMovieItemRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !isLoading) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "0px",
          threshold: 1.0,
        }
      );

      observer.observe(el);

      return () => {
        if (!el) return;
        observer.unobserve(el);
      };
    },
    [fetchNextPage, isLoading]
  );

  const handleClickMenu = (menu) => {
    setCategory(menu);
  };

  console.log(category);
  return (
    <MovieTrackerLayout>
      <TopNavBarLayout>
        <TopNavBarMenuContainer>
          <TopNavBarLogoText>MovieTracker</TopNavBarLogoText>
          {menuList.map((menu, index) => (
            <TopNavBarMenuItem
              key={index}
              onClick={() => handleClickMenu(menu.path)}
            >
              {menu.title}
            </TopNavBarMenuItem>
          ))}
        </TopNavBarMenuContainer>
        <TopNavBarSearchInput />
      </TopNavBarLayout>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {movieList.map((movie) => (
          <div key={movie.id}>
            <img src={"https://image.tmdb.org/t/p/w200" + movie.poster_path} />
            <p>{movie.title}</p>
          </div>
        ))}
        <div ref={lastMovieItemRef}></div>
      </div>
    </MovieTrackerLayout>
  );
}

export default App;

const MovieTrackerLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`;

const TopNavBarLayout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TopNavBarMenuContainer = styled.div`
  display: flex;
`;

const TopNavBarLogoText = styled.span`
  font-weight: 700;
  font-size: 48px;
  color: yellow;
`;

const TopNavBarMenuItem = styled.button`
  width: 120px;
  padding: 8px 4px;
  background-color: transparent;
`;

const TopNavBarSearchInput = styled.input`
  width: 100%;
`;
