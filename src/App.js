import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { Navbar } from './components/navbar';
import { Users } from './components/users';
import { Search } from './components/search';
import { User } from './components/user';

import { useDebounce } from './hooks/useDebouncer';

const App = () => {
  const [search, setSearch] = useState('gabriel');
  const [selectedUser, setSelectedUser] = useState('');
  const debouncedSearch = useDebounce(search, 1000);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const selectUser = (username) => {
    setSelectedUser(username);
  };

  const { data, isLoading, fetchNextPage } = useInfiniteQuery(
    ['users', debouncedSearch],
    ({ pageParam = 1 }) => {
        return fetch(`https://api.github.com/search/users?q=${debouncedSearch}&page=${pageParam}&per_page=10`)
          .then((res) => res.json());
      }, {
      getNextPageParam: (lastPage, allPages) => {
        const totalPages = Math.round(lastPage.total_count / 10);

        return allPages.length >= totalPages ? false : allPages.length + 1;
      }
    });

  const items = data?.pages.reduce((prev, current) => {
    if (current.documentation_url) {
      return [];
    }

    return prev.concat(current.items)
  }, []);

  return (
    <div>
      <Navbar />
      <div className="py-4 px-4 md:py-8 md:px-16 xl:py-16 xl:px-32">
        {
          selectedUser ? (
            <User username={selectedUser} selectUser={selectUser} />
          ) : (
            <>
              <Search
                onChange={onSearchChange}
              />
              <Users
                items={items}
                isLoading={isLoading}
                selectUser={selectUser}
              />
              <button
                className="px-4 py-2 rounded border-solid border-2 border-neutral-200 ml-auto block"
                onClick={() => fetchNextPage()}
              >
                Load More
              </button>
            </>
          )
        }
      </div>
    </div>
  );
}

export default App;
