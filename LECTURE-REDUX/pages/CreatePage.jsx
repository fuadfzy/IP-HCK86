import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { serverApi } from "../utils/api";
import { errorAlert, successToast } from "../utils/sweetAlert";
import { useDispatch } from "react-redux";
import { createMovie } from "../features/movies/movieSlice";

export default function CreatePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    title: "Your Name",
    coverUrl:
      "https://res.cloudinary.com/dpjqm8kkk/image/upload/v1723524534/hacktiv8/movies/your-name.-6f2521clk36.jpg",
    synopsis:
      "High schoolers Mitsuha and Taki are complete strangers living separate lives. But one night, they suddenly switch places. Mitsuha wakes up in Taki’s body, and he in hers. This bizarre occurrence continues to happen randomly, and the two must adjust their lives around each other",
  });

  const handleOnChange = (e) => {
    setForm((prevForm) => ({
      ...prevForm,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    dispatch(fetchMovieById(params.id))
  }, [])

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    // await createMovie(form)
    // { type: "movie/createMovie", payload: form }
    await dispatch(createMovie(form)).unwrap();
    navigate("/");
  };

  return (
    <section id="create-page">
      <div className="container">
        <h2>Add Movie List</h2>
        <form onSubmit={handleOnSubmit}>
          <div className="mb-3">
            <label htmlFor="create-title" className="form-label">
              Title
            </label>
            <input
              type="text"
              className="form-control"
              id="create-title"
              value={form.title}
              name="title"
              onChange={handleOnChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="create-imageUrl" className="form-label">
              Image URL
            </label>
            <input
              type="text"
              className="form-control"
              id="create-imageUrl"
              value={form.coverUrl}
              name="coverUrl"
              onChange={handleOnChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="create-synopsis" className="form-label">
              Synopsis
            </label>
            <textarea
              className="form-control"
              id="create-synopsis"
              rows="5"
              value={form.synopsis}
              name="synopsis"
              onChange={handleOnChange}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
          <Link to="/">
            <button type="button" className="btn btn-secondary mx-2">
              Cancel
            </button>
          </Link>
        </form>
      </div>
    </section>
  );
}
