import { useEffect, useMemo, useRef, useState } from "react";
import MovieApi from "./apis/movie/movieApi";
import { useInfiniteQuery } from "@tanstack/react-query";
import styled from "@emotion/styled";
import { useNavigate, useParams } from "react-router-dom";

function App() {
  const lastMovieItemRef = useRef(null);
  const navigate = useNavigate();
  const params = useParams();

  const menuList = [
    { title: "현재 상영작", path: "now_playing" },
    { title: "인기 영화", path: "popular" },
    { title: "평점 높은 영화", path: "top_rated" },
    { title: "개봉 예정작", path: "upcoming" },
  ];

  const [category, setCategory] = useState("upcoming");
  const [searchInput, setSearchInput] = useState("");

  const {
    data: movieData,
    fetchNextPage: fetchMovies,
    isLoading: isLoadingMovies,
  } = useInfiniteQuery({
    queryKey: ["movieList", category],
    queryFn: ({ pageParam = 1 }) =>
      MovieApi.getUpComingMovieList({ category, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.page + 1,
  });

  const {
    data: searchData,
    fetchNextPage: fetchSearchResults,
    isLoading: isLoadingSearch,
  } = useInfiniteQuery({
    queryKey: ["searchResults", searchInput],
    queryFn: ({ pageParam = 1 }) =>
      MovieApi.searchKeyword({ query: searchInput, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.page + 1,
  });

  const movieList = useMemo(() => {
    if (!movieData) return [];
    return movieData.pages.flatMap((page) => page.results);
  }, [movieData]);

  const searchResults = useMemo(() => {
    if (!searchData) return [];
    return searchData.pages.flatMap((page) => page.results);
  }, [searchData]);

  useEffect(() => {
    const el = lastMovieItemRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (searchResults.length > 0) {
            fetchSearchResults();
          } else {
            fetchMovies();
          }
        }
      },
      { rootMargin: "0px", threshold: 1.0 }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [fetchMovies, fetchSearchResults, searchResults]);

  useEffect(() => {
    if (params.category) {
      setCategory(params.category);
    }
  }, [params]);

  const handleClickMenu = (menu) => {
    setCategory(menu);
    setSearchInput("");
    navigate(`/${menu}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchInput(searchInput.trim());
    }
  };

  const display = searchResults.length > 0 ? searchResults : movieList;

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
        <form onSubmit={handleSubmit}>
          <TopNavBarSearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="영화 검색"
          />
          <SearchButton type="submit">Search</SearchButton>
        </form>
      </TopNavBarLayout>
      <MovieContentWrapper>
        {display.length > 0 ? (
          display.map((movie) => (
            <MovieContentItem key={movie.id}>
              <MovieContentItemImg
                src={"https://image.tmdb.org/t/p/w200" + movie.poster_path}
                alt={movie.title}
              />
              <MovieContentItemTitle>{movie.title}</MovieContentItemTitle>
            </MovieContentItem>
          ))
        ) : (
          <NoResultText>
            {searchResults.length > 0
              ? "해당 키워드 영화가 없음."
              : "카테고리에 영화가 없음"}
          </NoResultText>
        )}
        <div ref={lastMovieItemRef}></div>
      </MovieContentWrapper>
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
  width: 900px;
  padding: 8px;
`;

const SearchButton = styled.button`
  padding: 8px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const MovieContentWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 24px;
`;

const MovieContentItem = styled.div`
  border-radius: 16px;
  max-width: 200px;
`;

const MovieContentItemImg = styled.img`
  border-radius: 16px;
`;

const MovieContentItemTitle = styled.p`
  font-size: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const NoResultText = styled.div`
  text-align: center;
  font-size: 18px;
  color: gray;
`;
