import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { deleteMovieById } from "../features/movies/movieSlice";

export default function MovieCard({ movie }) {
  const dispatch = useDispatch();

  return (
    <div className="card mx-1" style={{ width: "14rem", overflow: "hidden" }}>
      <img src={movie.imgUrl} className="card-img-top" alt={movie.title} />
      <div className="card-body">
        <h5 className="card-title">{movie.title}</h5>
        <h6 className="card-subtitle mb-2 text-body-secondary">
          Rating: <span className="text-body">{movie.rating}</span>
        </h6>
        <p className="card-text">{movie.synopsis?.slice(0, 50)}...</p>
      </div>
      <button
        className="btn btn-danger w-100 rounded-0"
        onClick={() => dispatch(deleteMovieById(movie.id))}
      >
        Remove
      </button>
    </div>
  );
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    synopsis: PropTypes.string,
    trailerUrl: PropTypes.string,
    imgUrl: PropTypes.string,
    rating: PropTypes.number,
    genreId: PropTypes.number,
    authorId: PropTypes.number,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    User: PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      email: PropTypes.string,
      role: PropTypes.string,
      phoneNumber: PropTypes.string,
      address: PropTypes.string,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    }),
  }).isRequired,
  onDelete: PropTypes.func,
};
