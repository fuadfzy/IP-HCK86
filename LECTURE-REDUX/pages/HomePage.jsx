import { useEffect } from "react";
import { Link } from "react-router";
import MovieCard from "../components/MovieCard";
import { errorAlert } from "../utils/sweetAlert";
import { serverApi } from "../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { fetchMovies } from "../features/movies/movieSlice";

export default function HomePage() {
  // 5. useSelector ke-trigger
  const movies = useSelector((state) => state.movies.list);
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. fetchMovies jalan
    dispatch(fetchMovies());
  }, []);
  return (
    <section id="home-page">
      <div className="container mb-3">
        <h2 className="text-center py-3">My Movie List</h2>
        <Link to="/create">
          <button
            className="btn btn-primary"
            style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
            type="button"
          >
            <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>+</span>{" "}
            Add
          </button>
        </Link>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
}
