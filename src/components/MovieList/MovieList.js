import React from 'react';
import { Spin, Alert, Pagination } from 'antd';

import MovieCard from '../MovieCard';

import './MovieList.css';

export default class MovieList extends React.Component {
  state = {
    loading: false,
    error: false,
    page: 1,
    value: 3,
  };

  onChangePagination = (page) => {
    this.setState({
      page: page,
    });
    this.props.changeStatePage(page);
  };

  onError = () => {
    this.setState({
      loading: false,
      error: true,
    });
  };

  render() {
    const { loading, error, page, pageNumber, result, moviesData, onChangeVote } = this.props;

    let pagination =
      !!moviesData.length && !loading && !error ? (
        <Pagination className="pagination" total={pageNumber} current={page} onChange={this.onChangePagination} />
      ) : null;

    let resMessage = result ? (
      <Alert className="movielist__error" type="error" showIcon="true" message="Movies was not found" />
    ) : null;
    return (
      <div>
        <div className="movielist">
          {resMessage}
          {!error ? (
            loading ? (
              <Spin className="movielist__spin" />
            ) : (
              moviesData.map((item) => {
                return (
                  <MovieCard
                    key={item.id}
                    id={item.id}
                    date={item.release_date}
                    title={item.original_title}
                    overview={item.overview}
                    loading={loading}
                    logo={item.poster_path}
                    genre={item.genre_ids}
                    voteAvg={item.vote_average}
                    stars={item.rating}
                    onChangeVote={onChangeVote}
                  />
                );
              })
            )
          ) : (
            <Alert className="movielist__error" type="error" message="Connection rejection" showIcon="true" />
          )}
        </div>
        <div className="pagination">{pagination}</div>
      </div>
    );
  }
}
