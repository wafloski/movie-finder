import React, { useState } from 'react';
import {
  Box,
  Button,
  ChakraProvider,
  Container,
  Heading,
  Input,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  imdbRating: string;
  Country?: string;
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [type, setType] = useState<string>('movie');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchMovies = async () => {
    const response = await fetch(
      `https://www.omdbapi.com/?s=${searchTerm}&type=${type}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.Response === 'True') {
      return (data.Search);
    } else {
      setError(data.Error);
      return ([]);
    }
  };

  const getMovieDetails = async (imdbID: string) => {
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`);
    return await response.json();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMovies([]);
    setLoading(true);
    setError(null);
    try {
      const results = await fetchMovies();

      if (!results) {
        setError('No results found.')
      } else {
        const detailedMovies: Movie[] = await Promise.all(
          results.map(async (movie: { imdbID: string; }) => {
            const details = await getMovieDetails(movie.imdbID);
            return {
              Title: details.Title,
              Year: details.Year,
              Country: details.Country,
              Type: details.Type,
              Poster: details.Poster,
            };
          })
        )
        setMovies(detailedMovies);
      }
    } catch (error) {
      console.log(error);
      setError('Fetch data error.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setSearchTerm('');
    setMovies([]);
  }

  return (
    <ChakraProvider>
      <Container minHeight="100vh" maxWidth="100vw" pt={20}>
        <Box textAlign="center" mb={6}>
          <Heading>Movie Finder</Heading>
        </Box>
        <Box
          as="form"
          onSubmit={handleSearch}
          mb={6}
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={4}
        >
          <Input
            placeholder="Enter title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="300px"
          />
          <Select
            width="200px"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="movie">Movie</option>
            <option value="series">Series</option>
            <option value="episode">Episode</option>
          </Select>
          <Button colorScheme="blue" type="submit" isDisabled={isLoading || searchTerm.trim() === ''}>
            Search
          </Button>
          <Button colorScheme="orange" isDisabled={isLoading || !movies.length} onClick={clearData}>
            Reset
          </Button>
        </Box>

        {isLoading && (
          <Box textAlign="center" mb={6}>
            <Spinner size="xl" mt={20} />
          </Box>
        )}
        {error && (
          <Box textAlign="center" mb={6}>
            <Text color="red.500" mt={20}>
              {error}
            </Text>
          </Box>
        )}

        {movies.length > 0 && (
          <Table variant="simple" mt={16}>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Year</Th>
                <Th>Country</Th>
                <Th>Type</Th>
                <Th>Poster</Th>
              </Tr>
            </Thead>
            <Tbody>
              {movies.map((movie) => (
                <Tr key={movie.imdbID}>
                  <Td>{movie.Title}</Td>
                  <Td>{movie.Year}</Td>
                  <Td>{movie.Country}</Td>
                  <Td>{movie.Type}</Td>
                  <Td>
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      style={{
                        height: '180px',
                        width: '120px',
                        objectFit: 'cover',
                      }}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Container>
    </ChakraProvider>
  );
};

export default App;
