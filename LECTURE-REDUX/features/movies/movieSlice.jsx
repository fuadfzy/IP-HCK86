import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { serverApi } from "../../utils/api";
import Swal from "sweetalert2";

export const movieSlice = createSlice({
  name: "movie",
  initialState: {
    list: [],
  },
  reducers: {
    setMovies: (state, action) => {
      // 4. akan di set
      // action.payload = data.data
      state.list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMovies.fulfilled, (state, action) => {
      state.list = action.payload;
    });
    builder.addCase(deleteMovieById.fulfilled, (state, action) => {
      // Remove the deleted movie from the list
      state.list = state.list.filter((movie) => movie.id !== action.payload);
      Swal.fire({
        title: "Deleted!",
        text: "Your movie has been deleted.",
        icon: "success",
      });
    });
    builder.addCase(createMovie.fulfilled, (state, action) => {
      // Add the newly created movie to the list
      state.list.push(action.payload);
      Swal.fire({
        title: "Success!",
        text: `${action.payload.title} has been added.`,
        icon: "success",
      });
    });
    builder.addCase(createMovie.rejected, (state, action) => {
      console.log(action, "<<< a");
      Swal.fire({
        title: "Error!",
        text: action.error.message,
        icon: "error",
      });
    });
  },
});

// Action creators are generated for each case reducer function
export const { setMovies } = movieSlice.actions;

export const fetchMovies = createAsyncThunk(
  "movie/fetchMovies",
  async (props) => {
    // props.q
    const { data } = await serverApi.get(
      "/apis/pub/movies/movies?q=" + props.q,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    ///.   axios
    return data.data;
  }
);

export const deleteMovieById = createAsyncThunk(
  "movie/deleteMovieById",
  async (movieId) => {
    await serverApi.delete("/apis/movies/movies/" + movieId, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    return movieId;
  }
);

export const createMovie = createAsyncThunk(
  "movie/createMovie",
  async (form) => {
    try {
      const { data } = await serverApi.post("/apis/movies/movies", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      return data.data;
    } catch (err) {
      // AxiosError -> instance
      //! SEMUA YANG MASUK KE REDUCER NYA REDUX PASTI AKAN DI SERIALIZE
      throw {
        message: err.response.data.message,
      };
    }
  }
);

export default movieSlice.reducer;
