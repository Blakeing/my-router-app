import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

interface Pokemon {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  results: Pokemon[];
}

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data, isLoading } = useQuery<PokemonListResponse>({
    queryKey: ["pokemon"],
    queryFn: async () => {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=20"
      );
      return response.json();
    },
  });

  if (isLoading) return <div className="p-4">Loading Pokémon...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pokémon List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.results.map((pokemon) => (
          <Link
            key={pokemon.name}
            to="/pokemon/$name"
            params={{ name: pokemon.name }}
            className="p-4 border rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg capitalize">{pokemon.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
