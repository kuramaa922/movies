import React from 'react';
import { format } from 'date-fns';
import { Card, Tag, Rate, Spin } from 'antd';
import './MovieCard.css';

export default class MovieCard extends React.Component {
  state = {
    img: null,
    vote: 0,
  };

  render() {
    const { img, vote } = this.state;
    const { id, title, overview, logo, date, voteAvg, onChangeVote, genre } = this.props;

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
              {' '}
              {genre.map((item) => (
                <Tag key={item.id}>{item.name}</Tag>
              ))}
            </div>
          </div>
          <p className="card__text">{overview}</p>
          <Rate onChange={onChangeVote.bind(this, id)} count={10} value={vote} allowHalf />
        </div>
      </Card>
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
