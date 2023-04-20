import React from 'react';
import './App.css';
import { Alert } from 'antd';

import MovieList from '../MovieList';
import Header from '../Header';
import Search from '../Search';
import moviesApi from '../../services/moviesApi';
import { GenresProvider } from '../GenresContext/GenresContext';

export default class App extends React.Component {
  apiInstance = new moviesApi('7d1ef95b6c882e58c8cbc9d5640386a3');

  state = {
    genres: [],
    active: 'search',
    error: false,
    searchQuery: '',
  };

  async componentDidMount() {
    try {
      await this.apiInstance.createSession();
      const data = await this.apiInstance.getGenres();
      this.setState({ genres: data.genres });
    } catch (err) {
      return err;
    }
  }

  componentDidCatch() {
    this.setState({
      error: true,
    });
  }

  search = (e) => {
    this.setState({
      searchQuery: e.target.value,
    });
  };

  onActive = (e) => {
    this.setState(() => {
      return {
        active: e,
      };
    });
  };

  render() {
    const { genres, active, error, searchQuery } = this.state;

    return (
      <main className="container">
        {!error ? (
          <GenresProvider value={genres}>
            <Header setActive={this.onActive} active={active} />
            {active === 'search' ? <Search search={this.search} /> : null}
            <MovieList searchQuery={searchQuery} active={active} />
          </GenresProvider>
        ) : (
          <Alert
            className="error-vpn"
            type="error"
            message="Please, check your internet connection or turn on VPN!"
            showIcon="true"
          />
        )}
      </main>
    );
  }
}
