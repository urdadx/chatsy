import { Button } from "@/components/ui/button";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container mx-auto max-w-3xl px-4 py-2 text-center">
        <Link to="/login">
          <Button>Go to login</Button>
        </Link>
      </div>
    </div>
  );
}
