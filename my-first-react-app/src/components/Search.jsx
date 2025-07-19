import React from 'react'

const Search = ({searchterm,setsearchterm}) => {
  return (
    <div className="search">
        <div>
            <img src="search.png" alt="search" />
            <input type="text" 
            placeholder='Search through thousands of movies'
            value={searchterm}
            onChange={(event)=>setsearchterm(event.target.value)}/>
        </div>
    </div>
  )
}

export default Search
