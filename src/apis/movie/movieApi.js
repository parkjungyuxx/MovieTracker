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
};

export default MovieApi;
