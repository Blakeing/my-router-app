import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/form")({
  component: FormLayout,
});

function FormLayout() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Multi-step Form</h1>
      <Outlet />
    </div>
  );
}
