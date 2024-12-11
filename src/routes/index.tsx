import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const pokemonQuery = useQuery({
    queryKey: ["pokemon", offset],
    queryFn: async () => {
      NProgress.start();
      const maxPokemon = 151;
      const adjustedLimit = Math.min(limit, maxPokemon - offset);

      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${adjustedLimit}&offset=${offset}`
      );
      const data = await res.json();
      NProgress.done();
      return {
        results: data.results,
        count: maxPokemon,
      };
    },
    enabled: offset < 151,
  });

  const totalPages = Math.ceil(151 / limit); // Hard code to 151 for Gen 1

  // Helper function to generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(null); // for ellipsis
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push(null); // for ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(null); // for ellipsis
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push(null); // for ellipsis
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Pokemon List</h1>
        <Button asChild>
          <Link to="/form/$step" params={{ step: "1" }}>
            Try Multi-Step Form
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4 min-h-[24rem]">
        {pokemonQuery.isLoading ? (
          <div className="col-span-4" />
        ) : (
          pokemonQuery.data?.results.map((pokemon: { name: string }) => (
            <Link
              key={pokemon.name}
              to="/pokemon/$name"
              params={{
                name: pokemon.name,
              }}
              className="p-4 border rounded hover:bg-gray-50"
            >
              <div>{pokemon.name}</div>
            </Link>
          ))
        )}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={
                page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>

          {getPageNumbers().map((pageNumber, idx) =>
            pageNumber === null ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  onClick={() => setPage(pageNumber)}
                  isActive={page === pageNumber}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={
                page === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
