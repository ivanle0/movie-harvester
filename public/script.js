document.getElementById('fetchMoviesButton').addEventListener('click', fetchMoviesByYear);

async function fetchMoviesByYear() {
  const year = document.getElementById('year').value;
  
  const moviesList = document.getElementById('movies-list');
  moviesList.innerHTML = '<p>Loading movies...</p>';

  try {
    const response = await fetch(`/api/movies/${year}`);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    moviesList.innerHTML = ''; // Clear old results

    if (data.error) {
      alert(data.error);
    } else if (data.message) {
      alert(data.message);
    } else if (Array.isArray(data) && data.length === 0) {
      moviesList.innerHTML = '<p>No movies found for this year.</p>';
    } else {
      data.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
          <h3>${movie.title}</h3>
          <p>Year: ${movie.year}</p>
          <p>Genre: ${movie.genre}</p>
          <p>Owned: ${movie.owned ? 'Yes' : 'No'}</p>
          <p>IMDB ID: ${movie.imdb_id}</p>
        `;
        moviesList.appendChild(movieElement);
      });
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    alert('Error fetching movies.');
    moviesList.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  }
}