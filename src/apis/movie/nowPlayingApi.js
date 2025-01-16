import AxiosInstance from "../core";

const MovieApi = {
  async getUpComingMovieList({ page = 1 }) {
    const response = await AxiosInstance.get("/movie/now_playing", {
      params: {
        page,
        language: "ko-KR",
      },
    });
    return response.data;
  },
};

export default MovieApi;
