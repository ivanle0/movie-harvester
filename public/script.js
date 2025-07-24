document.getElementById('fetchMoviesButton').addEventListener('click', function() {
  const year = document.getElementById('year').value;

  fetch(`/api/movies/${year}`)
    .then(response => response.json())
    .then(data => {
      const moviesList = document.getElementById('movies-list');
      moviesList.innerHTML = ''; // Clear the list before displaying new data

      // If there's an error or no movies found
      if (data.error) {
        alert(data.error);
      } else if (data.message) {
        alert(data.message);
      } else {
        // If we get movie data, display them
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
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
      alert('Error fetching movies.');
    });
});