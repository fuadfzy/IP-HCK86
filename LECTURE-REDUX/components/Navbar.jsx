import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { fetchMovies } from "../features/movies/movieSlice";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const isLogin = useMemo(() => {
    // calculate expensive value
    return !!localStorage.getItem("access_token");
  }, []);

  useEffect(() => {
    dispatch(fetchMovies({ q: search }));
  }, [search]);

  return (
    <nav className="navbar navbar-expand-lg bg-light sticky-top">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <h5>MyMovieList</h5>
        </a>
        <input
          type="text"
          className="form-control"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="navbar-nav me-auto"></div>
          {isLogin && (
            <button
              className="btn btn-outline-danger mx-1"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}