import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/spinner'; // Adjust the path if needed
import Moviecard from './components/moviecard';
import { gettrendingmovies, updatesearchcount } from './appwrite.js';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

// ✅ Custom Debounce Hook
function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const App = () => {

  const [searchterm, setsearchterm] = useState('');
  const [errormessage, seterrormessage] = useState('');
  const [movielist, setmovielist] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [trendingmovies,settrendingmovies]=useState([]);

  // ✅ Use custom debounce
  const debouncedSearchTerm = useDebouncedValue(searchterm, 500);

  const fetchmovies = async (query = '') => {
    setisloading(true);
    seterrormessage('');
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        seterrormessage(data.Error || 'Failed to fetch movies');
        setmovielist([]);
        return;
      }

      setmovielist(data.results || []);

      // ✅ FIXED: Wrap the Appwrite update in a try-catch to prevent crashes
      if (query && data.results.length > 0) {
        try {
          await updatesearchcount(query, data.results[0]);
        } catch (err) {
          console.error("Error updating search count:", err);
        }
      }

    } catch (error) {
      console.log(`Error fetching movies: ${error}`);
      seterrormessage('Error fetching movies. Please try again later.');
    } finally {
      setisloading(false);
    }
  }

  const loadtrendingmovies = async() =>
  {
    try{
      const movies = await gettrendingmovies();

      settrendingmovies(movies);
    }
    catch(error){
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchmovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);


  useEffect(()=> {
    loadtrendingmovies();
  },[]);

  return (
    <main>
      <div className="pattern" />
      <div className='wrapper'>
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchterm={searchterm} setsearchterm={setsearchterm} />
          <h1 className='text-white'>{searchterm}</h1>
        </header>


        {trendingmovies.length>0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingmovies.map((movie,index)=>(
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='All movies'>
          <h2>All movies</h2>

          {isloading ? (
            <Spinner />
          ) : errormessage ? (
            <p className='text-red-500'>{errormessage}</p>
          ) : (
            <div className="max-w-6xl mx-auto px-4">
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movielist.map((movie) => (
                  <Moviecard key={movie.id} movie={movie} />
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
