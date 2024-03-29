import {useEffect, useState} from 'react';
import FilmsList from '../../components/films-list/films-list';
import Footer from '../../components/footer/footer';
import GenresList from '../../components/genres-list/genres-list';
import PromoCard from '../../components/promo-card/promo-card';
import ShowMoreButton from '../../components/show-more-button/show-more-button';
import Spinner from '../../components/spinner/spinner';
import {useAppDispatch, useAppSelector} from '../../hooks/';
import {fetchFilmsByGenre, fetchPromo} from '../../store/api-actions';
import {
  getActiveGenre,
  getFilmsByGenre,
  getIsLoading as getFilmsByGenreIsLoading,
} from '../../store/genre-data/selectors';
import {getIsLoading as getPromoIsLoading, getPromoFilm,} from '../../store/promo-data/selectors';

const FILMS_PER_STEP = 8;

function MainPage() {
  const dispatch = useAppDispatch();
  const isFilmsByGenreLoading = useAppSelector(getFilmsByGenreIsLoading);
  const filmsByGenre = useAppSelector(getFilmsByGenre);
  const isPromoLoading = useAppSelector(getPromoIsLoading);
  const promoFilm = useAppSelector(getPromoFilm);
  const activeGenre = useAppSelector(getActiveGenre);
  const [filmsDisplayed, setFilmsDisplayed] = useState(0);

  useEffect(() => {
    dispatch(fetchPromo());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchFilmsByGenre(activeGenre));
  }, [dispatch, activeGenre]);

  useEffect(() => {
    setFilmsDisplayed(Math.min(filmsByGenre.length, FILMS_PER_STEP));
  }, [filmsByGenre]);

  const handleShowMoButtonClick = () => {
    setFilmsDisplayed((prevFilmsDisplayed) =>
      Math.min(filmsByGenre.length, prevFilmsDisplayed + FILMS_PER_STEP)
    );
  };

  if (isPromoLoading || isFilmsByGenreLoading) {
    return <Spinner />;
  }

  return (
    <>
      {promoFilm && <PromoCard promoFilm={promoFilm} />}
      <div className="page-content">
        <section className="catalog">
          <h2 className="catalog__title visually-hidden">Catalog</h2>

          <GenresList />

          <FilmsList films={filmsByGenre.slice(0, filmsDisplayed)} withVideo />
          {filmsByGenre.length > filmsDisplayed && (
            <ShowMoreButton onClick={handleShowMoButtonClick} />
          )}
        </section>

        <Footer />
      </div>
    </>
  );
}

export default MainPage;
