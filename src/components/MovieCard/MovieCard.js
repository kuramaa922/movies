import React from 'react';
import { format } from 'date-fns';
import { Card, Tag, Rate, Spin, Alert } from 'antd';

import moviesApi from '../../services/moviesApi';
import './MovieCard.css';
import { GenresConsumer } from '../GenresContext/GenresContext';

export default class MovieCard extends React.Component {
  apiInstance = new moviesApi('7d1ef95b6c882e58c8cbc9d5640386a3');

  state = {
    img: null,
    stars: 0,
    error: false,
  };

  setRate = async (value) => {
    const { id, getRateFilms, rateLoad } = this.props;
    this.setState({
      stars: value,
    });
    rateLoad();

    await this.apiInstance.postMoviesRate(value, id);
    setTimeout(async () => {
      try {
        await getRateFilms();
      } catch (err) {
        this.setState({
          error: true,
        });
      }
    }, 1000);
  };

  render() {
    const { img, stars, error } = this.state;
    const { title, overview, logo, date, voteAvg, starsRate, genre } = this.props;

    let colorRate = voteAvg >= 7 ? '#66E900' : voteAvg >= 5 ? '#E9D100' : voteAvg >= 3 ? '#E97E00' : '#E90000';

    const imgLoad = img ? <img src={logo} alt="logo" /> : <Spin className="spin" />;

    if (!this.state.img) {
      let image = new Image();
      image.src = logo;
      image.onload = () => {
        this.setState({ img: true });
      };
    }

    return (
      <GenresConsumer>
        {(genres) => {
          return (
            <>
              {!error ? (
                <Card className="card">
                  <div className="card__image">{imgLoad}</div>
                  <div className="card__content">
                    <div className="card__info">
                      <div className="header">
                        <div className="header__title">
                          <h5>{title}</h5>
                        </div>
                        <div className="header__rate" style={{ border: `2px solid ${colorRate}` }}>
                          <span>{voteAvg.toFixed(1)}</span>
                        </div>
                      </div>
                      <p>{date ? format(new Date(date), 'MMMM d, yyyy') : 'none'}</p>
                      <div className="header__tags">
                        {genre.map((item) => {
                          const textGenre = genres.find((el) => {
                            if (el.id === item) return el.name;
                          });
                          return <Tag key={item}>{textGenre.name}</Tag>;
                        })}
                      </div>
                    </div>
                    <p className="card__text">{overview}</p>
                    <Rate onChange={this.setRate} count={10} value={starsRate || stars} allowHalf />
                  </div>
                </Card>
              ) : (
                <Alert type="error" showIcon="true" message="No Internet Connection" />
              )}
            </>
          );
        }}
      </GenresConsumer>
    );
  }
}

// const RenderCard = (card) => {
//
//     return (
//         <React.Fragment>
//
//         </React.Fragment>
//     )
// }
