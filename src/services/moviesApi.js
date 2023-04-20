export default class moviesApi {
  _apiBase = 'https://api.themoviedb.org/3';
  _apiImage = 'https://image.tmdb.org/t/p/w500';
  _noImage = 'https://critics.io/img/movies/poster-placeholder.png';

  constructor(key) {
    this.apiKey = key;
    this.genres = null;
    this.sessionId = '';
  }

  getImage = (imgPath) => (imgPath ? `${this._apiImage}${imgPath}` : `${this._noImage}`);

  getResource(request) {
    return new Promise((resolve, reject) => {
      fetch(`${this._apiBase}${request.url}?api_key=${this.apiKey}${request.query}${request.page}`)
        .then((result) => {
          if (!result.ok) {
            throw new Error(`${result.status}`);
          }
          result.json().then((json) => {
            const data = this.imageLinkObject(json);
            resolve(data);
          });
        })
        .catch((err) => reject(err));
    });
  }

  imageLinkObject(result) {
    const newDataJson = JSON.stringify(result);
    const newData = JSON.parse(newDataJson);
    if (!Object.prototype.hasOwnProperty.call(newData, 'results')) {
      return { ...newData, poster_path: this.getImage(newData.poster_path) };
    }
    const changeData = newData.results.map((data) => {
      data.poster_path = this.getImage(data.poster_path);
      return data;
    });
    return { ...result, results: changeData };
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
      if (!data.ok) {
        throw new Error(`${data.status}`);
      }
      return data.json();
    } catch (err) {
      return err;
    }
  }

  postMoviesRate(stars, id) {
    try {
      this.sessionId = localStorage.getItem('guest_session_id');
      const path = `/movie/${id}/rating`;
      return this.postDataRate(path, stars);
    } catch (err) {
      return err;
    }
  }

  async getResourceRatedMovies(path, page = 1) {
    try {
      const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}&page=${page}`);
      if (data.status === 401) {
        localStorage.removeItem('guest_session_id');
        await this.createSession();
      }
      return data.json();
    } catch (error) {
      return error;
    }
  }

  async getRatedMovies(page = 1) {
    // this.sessionId = localStorage.getItem('guest_session_id');
    if (!this.sessionId) await this.createSession();

    const path = `/guest_session/${this.sessionId}/rated/movies`;
    const data = await this.getResourceRatedMovies(path, page);
    const newData = await this.imageLinkObject(data);

    return newData;
  }

  async createSession() {
    const path = '/authentication/guest_session/new';
    return await this.getData(path)
      .then((data) => {
        if (localStorage.getItem('guest_session_id')) {
          // this.sessionId = localStorage.getItem('guest_session_id');
          // return localStorage.getItem('guest_session_id');
          return (this.sessionId = localStorage.getItem('guest_session_id'));
        }
        this.sessionId = data.guest_session_id;
        localStorage.setItem('guest_session_id', data.guest_session_id);
      })
      .catch((error) => error);
  }
}
