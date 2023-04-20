import React from 'react';
import { Spin, Alert, Pagination } from 'antd';
import { debounce } from 'lodash';

import MovieCard from '../MovieCard';
import moviesApi from '../../services/moviesApi';

import './MovieList.css';

export default class MovieList extends React.Component {
  apiInstance = new moviesApi('7d1ef95b6c882e58c8cbc9d5640386a3');

  state = {
    moviesData: [],
    moviesRateData: [],
    loading: false,
    error: false,
    result: false,
    update: true,
    rateLoad: false,
    page: 1,
    query: '',
    pageRate: 1,
    pageRateAll: 1,
  };

  searchDebounce = debounce(
    (e) => {
      this.onChangeInputSearchMovies(e);
    },
    1000,
    {
      maxWait: Infinity,
    }
  );

  onError = () => {
    this.setState({
      moviesRateData: [],
      loading: false,
      error: true,
    });
  };

  onChangePagination = (page) => {
    const { active } = this.props;

    if (active === 'search') this.changePaginationSearch(page);
    if (active === 'rated') this.getRateFilms(page);
  };

  onChangeInputSearchMovies = (searchQuery) => {
    const { page } = this.state;
    if (!searchQuery) {
      this.setState({
        moviesData: [],
        query: '',
        page: 1,
      });
    }
    if (searchQuery) {
      this.setState(
        {
          page: 1,
          error: false,
          loading: true,
          result: false,
          query: searchQuery,
          moviesData: [],
        },
        () => {
          this.apiInstance
            .getMovieBySearch(searchQuery, page)
            .then((el) => {
              this.setState(() => {
                const newData = [...el.results];
                let res = null;
                res = newData.length === 0;
                return {
                  moviesData: newData,
                  pageNumber: el.total_pages,
                  loading: false,
                  result: res,
                };
              });
            })
            .catch(this.onError);
        }
      );
    }
  };

  changePaginationSearch = (page) => {
    this.setState(
      {
        page: page,
        moviesData: [],
      },
      () => {
        if (page) {
          this.setState(
            {
              loading: true,
              error: false,
              result: false,
            },
            () => {
              this.apiInstance
                .getMovieBySearch(this.state.query, this.state.page)
                .then((el) => {
                  this.setState(() => {
                    const newData = [...el.results];
                    let res = null;
                    res = newData.length === 0;
                    return {
                      moviesData: newData,
                      pageNumber: el.total_pages,
                      loading: false,
                      result: res,
                    };
                  });
                })
                .catch(this.onError);
            }
          );
        }
      }
    );
  };

  componentDidMount() {
    this.apiInstance
      .getRatedMovies()
      .then((data) => {
        this.setState(() => {
          return {
            moviesRateData: data.results,
            pageRateAll: data.total_pages,
            pageRate: data.page,
          };
        });
      })
      .catch(this.onError);
  }

  componentDidUpdate(prevProps, prevState) {
    const { searchQuery } = this.props;
    const { query, pageRate } = this.state;
    if (searchQuery != query) {
      this.searchDebounce(searchQuery);
    }
    const { moviesRateData } = this.state;
    if (moviesRateData !== undefined && prevState.moviesRateData !== undefined) {
      if (moviesRateData.length !== prevState.moviesRateData.length) {
        this.setState({ rateLoad: true });
        this.apiInstance
          .getRatedMovies(pageRate)
          .then((data) => {
            this.setState(() => {
              return { moviesRateData: data.results, rateLoad: false };
            });
          })
          .catch(this.onError);
      }
    }
  }

  getRateFilms = (page = 1) => {
    this.apiInstance.getRatedMovies(page).then((data) => {
      this.setState(() => {
        return {
          moviesRateData: data.results,
          pageRate: data.page,
          pageRateAll: data.total_pages,
        };
      });
    });
  };

  rateLoad = () => {
    this.setState({
      rateLoad: true,
    });
  };

  render() {
    const { moviesData, moviesRateData, result, page, loading, error, pageRate, pageRateAll, rateLoad, pageNumber } =
      this.state;
    const { active } = this.props;

    let load = loading ? <Spin className="movielist__spin" /> : null;
    let loadRate = rateLoad ? <Spin className="movielist__spin" /> : null;

    let dataFilms = active === 'search' ? moviesData : moviesRateData;

    let pagination;

    // let pagination =
    //   !!moviesData.length && !loading && !error ? (
    //     <Pagination className="pagination" total={pageNumber} current={page} onChange={this.onChangePagination} />
    //   ) : null;

    if (!!moviesData.length && !loading && !error) {
      if (active === 'search') {
        pagination = (
          // eslint-disable-next-line prettier/prettier
          <Pagination
            className="pagination"
            onChange={this.onChangePagination}
            current={page}
            total={pageNumber}
            defaultPageSize={1}
            showSizeChanger={false}
          />
        );
      } else if (!!moviesData.length && active === 'rated') {
        pagination = (
          <Pagination
            className="pagination"
            current={pageRate}
            total={pageRateAll}
            onChange={this.onChangePagination}
            defaultPageSize={1}
            showSizeChanger={false}
          />
        );
      }
    }

    let resMessage = result ? (
      <Alert className="movielist__error" type="error" showIcon="true" message="Movies was not found" />
    ) : null;
    return (
      <div>
        <div className="movielist">
          {resMessage}
          {load}
          {active === 'rated' ? loadRate : null}
          {!error ? (
            dataFilms.map((data) => {
              let newRate;
              if (!data.rating) {
                const test = moviesRateData.find((item) => item.id === data.id);
                test ? (newRate = test.rating) : null;
              }
              return (
                <MovieCard
                  id={data.id}
                  key={data.id}
                  title={data.original_title}
                  logo={data.poster_path}
                  overview={data.overview}
                  loading={loading}
                  date={data.release_date}
                  starsRate={data.rating || newRate}
                  voteAvg={data.vote_average}
                  genre={data.genre_ids}
                  rateLoad={this.rateLoad}
                  getRateFilms={this.getRateFilms}
                />
              );
            })
          ) : (
            // eslint-disable-next-line prettier/prettier
            <Alert
              className="movielist__error"
              message="Check your Internet Connection or turn on VPN!"
              type="error"
              showIcon="true"
            />
          )}
        </div>
        <div className="pagination">{pagination}</div>
      </div>
    );
  }
}
