import { Link } from "@remix-run/react";

export default function NoteIndexPage() {
  return (
    <p>
      No note selected. Select a note on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new note.
      </Link>
    
      <Link
                  to="/timeoff/new"
                  className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600"
                  >
                  Book time off
                </Link>
                  </p>
    
  );
}
