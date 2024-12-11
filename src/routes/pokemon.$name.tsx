import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import NProgress from "nprogress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Ruler, Weight, Tag } from "lucide-react";

type Pokemon = {
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  sprites: { front_default: string };
};

export const Route = createFileRoute("/pokemon/$name")({
  component: PokemonPage,
});

function PokemonPage() {
  const { name } = Route.useParams();
  const pokemonQuery = useQuery<Pokemon>({
    queryKey: ["pokemon", name],
    queryFn: async () => {
      NProgress.start();
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await res.json();
      NProgress.done();
      return data as Pokemon;
    },
  });

  if (pokemonQuery.error) return <ErrorCard />;

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="w-[380px] mx-auto min-h-[600px]">
        <CardHeader className="min-h-[100px] flex flex-col justify-center">
          <CardTitle className="capitalize text-center h-8 text-2xl flex items-center justify-center">
            {pokemonQuery.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              pokemonQuery.data?.name
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="h-48 flex items-center justify-center">
            <PokemonImage
              url={pokemonQuery.data?.sprites.front_default}
              isLoading={pokemonQuery.isLoading}
            />
          </div>
          <div className="space-y-4 min-h-[240px]">
            {pokemonQuery.isLoading ? (
              <StatsLoading />
            ) : (
              pokemonQuery.data && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Ruler className="h-5 w-5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Height</p>
                      <p className="text-sm text-muted-foreground">
                        {pokemonQuery.data.height / 10}m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Weight className="h-5 w-5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Weight</p>
                      <p className="text-sm text-muted-foreground">
                        {pokemonQuery.data.weight / 10}kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Tag className="h-5 w-5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Types</p>
                      <p className="text-sm text-muted-foreground">
                        {pokemonQuery.data.types
                          .map((t) => t.type.name)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PokemonImage({
  url,
  isLoading,
}: {
  url?: string;
  isLoading: boolean;
}) {
  const { isLoading: imageLoading } = useQuery({
    queryKey: ["image", url],
    queryFn: () =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.src = url!;
      }),
    enabled: !!url,
  });

  if (isLoading) return <Skeleton className="w-48 h-48 mx-auto rounded-lg" />;
  if (!url) return null;

  return (
    <div className="relative w-48 h-48 mx-auto">
      {imageLoading && <Skeleton className="absolute inset-0 rounded-lg" />}
      <img
        src={url}
        alt="Pokemon"
        className={cn(
          "absolute inset-0 w-full h-full rounded-lg object-contain",
          imageLoading ? "opacity-0" : "opacity-100"
        )}
      />
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 rounded-md border p-4"
        >
          <Skeleton className="h-5 w-5" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorCard() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="min-h-[24rem] grid place-items-center">
        <p className="text-muted-foreground">Failed to load Pokemon</p>
      </Card>
    </div>
  );
}
