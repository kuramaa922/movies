import React from 'react';
import './App.css';
import { debounce } from 'lodash';

import MovieList from '../MovieList';
import Header from '../Header';
import Search from '../Search';
import moviesApi from '../../services/moviesApi';

export default class App extends React.Component {
  apiInstance = new moviesApi('7d1ef95b6c882e58c8cbc9d5640386a3');

  state = {
    loading: null,
    error: false,
    moviesData: [],
    moviesRateData: [],
    result: false,
    update: false,
    page: 1,
    pageNumber: 1,
    pageVote: 1,
    allPageVote: 1,
    voteRes: 0,
    active: 'search',
    value: '',
  };

  async componentDidMount() {
    await this.apiInstance.createSession();
    const data = await this.apiInstance.getRatedMovies();

    this.setState(() => {
      return {
        moviesRateData: data.results,
        allPageVote: data.total_pages,
        pageVote: data.page,
      };
    });
  }

  async componentDidUpdate() {
    const { update } = this.state;

    if (update) {
      const data = await this.apiInstance.getRatedMovies();
      this.setState(() => {
        return {
          moviesRateData: data.results,
          update: false,
        };
      });
    }
    // console.log(this.state.moviesRateData);
  }

  searchDebounce = debounce(
    (e) => {
      this.onChangeInputSearch(e);
    },
    1000,
    { maxWait: Infinity }
  );

  onError = () => {
    this.setState({
      loading: false,
      error: true,
    });
  };

  onActive = (e) => {
    this.setState({
      active: e,
    });
  };

  onChangeVote = (id, vote) => {
    // console.log(this.state.moviesData);
    this.apiInstance.postMoviesRate(vote, id).then((item) => {
      if (item.success) {
        this.setState({
          update: true,
        });
      }
    });
  };

  onChangeInputSearch = (e) => {
    if (!e.target.value) {
      this.setState({
        moviesData: [],
      });
    }
    if (e.target.value) {
      this.setState(
        {
          loading: true,
          error: false,
          result: false,
          page: 1,
        },
        () => {
          this.apiInstance
            .getMovieBySearch(e.target.value, this.state.page)
            .then((item) => {
              // console.log(item);
              this.setState(() => {
                const newData = [...item.results];
                let res = null;
                newData.length === 0 ? (res = true) : (res = false);
                return {
                  moviesData: newData,
                  loading: false,
                  result: res,
                  pageNumber: item.total_pages,
                };
              });
            })
            .catch(this.onError);
        }
      );
    }
  };

  changeStateValue = (value) => {
    // console.log(value);
    this.setState({
      value: value,
    });
  };

  changeStatePage = (value) => {
    this.setState(
      {
        page: value,
      },
      () => {
        if (value) {
          this.setState(
            {
              result: false,
              loading: true,
              error: false,
            },
            () => {
              this.apiInstance
                .getMovieBySearch(this.state.value, this.state.page)
                .then((item) => {
                  this.setState(() => {
                    const newData = [...item.results];
                    let res = null;
                    newData.length === 0 ? (res = true) : (res = false);
                    return {
                      moviesData: newData,
                      result: res,
                      loading: false,
                      pageNumber: item.total_pages,
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

  render() {
    const { moviesData, moviesRateData, page, pageNumber, allPageVote, loading, error, active, result } = this.state;

    return (
      <main className="container">
        <Header setActive={this.onActive} active={active} />
        {active === 'search' ? (
          <Search changeStateValue={this.changeStateValue} searchDebounce={this.searchDebounce} active={active} />
        ) : null}
        <MovieList
          moviesData={active === 'search' ? moviesData : moviesRateData}
          page={page}
          pageNumber={active === 'search' ? pageNumber : allPageVote}
          result={result}
          loading={loading}
          error={error}
          onChangeVote={this.onChangeVote}
          changeStatePage={this.changeStatePage}
        />
      </main>
    );
  }
}
