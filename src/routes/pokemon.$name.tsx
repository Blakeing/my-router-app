import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

interface PokemonDetail {
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
}

export const Route = createFileRoute("/pokemon/$name")({
  component: PokemonPage,
});

function PokemonPage() {
  const { name } = Route.useParams();

  const { data, isLoading } = useQuery<PokemonDetail>({
    queryKey: ["pokemon", name],
    queryFn: async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      return response.json();
    },
  });

  if (isLoading) return <div className="p-4">Loading Pokémon details...</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 capitalize">{data?.name}</h1>
      {data?.sprites.front_default && (
        <img
          src={data.sprites.front_default}
          alt={data.name}
          className="w-48 h-48 mx-auto"
        />
      )}
      <div className="mt-4">
        <p>Height: {data?.height}</p>
        <p>Weight: {data?.weight}</p>
        <p>Types: {data?.types.map((t) => t.type.name).join(", ")}</p>
      </div>
    </div>
  );
}
