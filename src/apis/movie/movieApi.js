import AxiosInstance from "../core";

const MovieApi = {
  async getUpComingMovieList({ category = "upcoming", page = 1 }) {
    const response = await AxiosInstance.get(`/movie/${category}`, {
      params: {
        page,
        language: "ko-KR",
      },
    });
    return response.data;
  },

  async searchKeyword({ query, page = 1 }) {
    const response = await AxiosInstance.get(`/search/movie`, {
      params: {
        page,
        query,
        language: "ko-KR",
      },
    });
    return response.data;
  },
  // async getMoviesByKeyword({ keywordId, page = 1 }) {
  //   const response = await AxiosInstance.get(`/keyword/${keywordId}/movies`, {
  //     params: {
  //       include_adult: false,
  //       language: "ko-KR",
  //       page,
  //     },
  //   });
  //   return response.data;
  // },
};

export default MovieApi;
