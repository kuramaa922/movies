export default class moviesApi {
  _apiBase = 'https://api.themoviedb.org/3';
  _apiImage = 'https://image.tmdb.org/t/p/w500';
  _noImage = 'https://critics.io/img/movies/poster-placeholder.png';

  constructor(key) {
    this.apiKey = key;
    this.genres = null;
  }

  getImage = (imgPath) => (imgPath ? `${this._apiImage}${imgPath}` : `${this._noImage}`);

  async getResource(request) {
    return new Promise((resolve, reject) => {
      fetch(`${this._apiBase}${request.url}?api_key=${this.apiKey}${request.query}${request.page}`)
        .then((result) => {
          if (!result.ok) {
            throw new Error(`${result.status}`);
          }

          result
            .json()
            .then((json) => {
              return this.imageLinkObject(json);
            })
            .then((json) => {
              if (Object.prototype.hasOwnProperty.call(json, 'results')) {
                this.getGenres()
                  .then((genres) => {
                    // here
                    json.results.forEach((film) => {
                      film.genre_ids = film.genre_ids.map((id) => ({
                        id: id,
                        name: genres.genres.find((genre) => genre.id === id).name,
                      }));
                    });
                    // console.log(json);
                    resolve(json);
                  })
                  .catch((err) => reject(err));
              } else resolve(json);
            });
        })
        .catch((err) => reject(err));
    });
  }

  imageLinkObject(result) {
    const newData = JSON.parse(JSON.stringify(result));

    if (!Object.prototype.hasOwnProperty.call(newData, 'results')) {
      return { ...newData, poster_path: this.getImage(newData.poster_path) };
    }

    const changedData = newData.results.map((item) => {
      item.poster_path = this.getImage(item.poster_path);
      return item;
    });
    return { ...result, results: changedData };
  }

  getMovieBySearch(query, page = 1) {
    const request = {
      url: '/search/movie',
      query: `&query=${query}`,
      page: `&page=${page}`,
    };
    return this.getResource(request);
  }

  getGenres() {
    return new Promise((resolve, reject) => {
      const request = {
        url: '/genre/movie/list',
        query: '',
        page: '',
      };

      if (!this.genres) {
        this.getResource(request)
          .then((genres) => {
            this.genres = genres;
            resolve(genres);
          })
          .catch((err) => reject(err));
      } else {
        resolve(this.genres);
      }
    });
  }

  async getData(path) {
    const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}`);
    return data.json();
  }

  async postDataRate(path, stars) {
    try {
      const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}&guest_session_id=${this.sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          value: stars,
        }),
      });
      if (data.status === 401) {
        localStorage.removeItem('guest_session_id');
        await this.createSession();
      }
      return data.json();
    } catch (err) {
      return err;
    }
  }

  postMoviesRate(stars, id) {
    try {
      const path = `/movie/${id}/rating`;
      return this.postDataRate(path, stars);
    } catch (error) {
      return error;
    }
  }

  async getResourceRatedMovies(path) {
    try {
      const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}`);
      return data.json();
    } catch (error) {
      return error;
    }
  }

  async getRatedMovies() {
    this.sessionId = localStorage.getItem('guest_session_id');
    const path = `/guest_session/${this.sessionId}/rated/movies`;
    const data = await this.getResourceRatedMovies(path);
    const newData = this.imageLinkObject(data);

    return new Promise((resolve, reject) => {
      if (Object.prototype.hasOwnProperty.call(newData, 'results')) {
        this.getGenres()
          .then((genres) => {
            // here
            newData.results.forEach((film) => {
              film.genre_ids = film.genre_ids.map((id) => ({
                id: id,
                name: genres.genres.find((genre) => genre.id === id).name,
              }));
            });
            resolve(newData);
          })
          .catch((err) => reject(err));
      } else resolve(newData);
    });
  }

  async createSession() {
    const path = '/authentication/guest_session/new';
    return await this.getData(path)
      .then((data) => {
        if (localStorage.getItem('guest_session_id')) {
          this.sessionId = localStorage.getItem('guest_session_id');
          return localStorage.getItem('guest_session_id');
        }
        this.sessionId = data.guest_session_id;
        localStorage.setItem('guest_session_id', data.guest_session_id);
      })
      .catch((error) => error);
  }
}
