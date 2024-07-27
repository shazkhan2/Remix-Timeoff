import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createTeam } from "~/models/team.server";
import { safeRedirect } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // This loader checks for a logged-in user, which isn't relevant here, so it could be omitted.
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title");
  // const code = formData.get("code");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Team title is required" } },
      { status: 400 }
    );
  }

  // if (typeof code !== "string" || code.length === 0) {
  //   return json(
  //     { errors: { title: null, code: "Team code is required" } },
  //     { status: 400 }
  //   );
  // }

  const team = await createTeam(title);
  return redirect(`/teams/${team.id}`);
};

export const meta: MetaFunction = () => [{ title: "Create Team" }];

export default function CreateTeamPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Team Title
            </label>
            <div className="mt-1">
              <input
                ref={titleRef}
                id="title"
                required
                autoFocus={true}
                name="title"
                type="text"
                aria-invalid={actionData?.errors?.title ? true : undefined}
                aria-describedby="title-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.title ? (
                <div className="pt-1 text-red-700" id="title-error">
                  {actionData.errors.title}
                </div>
              ) : null}
            </div>
          </div>

          {/* <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Team Code
            </label>
            <div className="mt-1">
              <input
                ref={codeRef}
                id="code"
                required
                name="code"
                type="text"
                aria-invalid={actionData?.errors?.code ? true : undefined}
                aria-describedby="code-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.code ? (
                <div className="pt-1 text-red-700" id="code-error">
                  {actionData.errors.code}
                </div>
              ) : null}
            </div>
          </div> */}

          <input type="hidden" name="redirectTo" value={redirectTo} />

          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Team
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have a team?{" "}
              <Link className="text-blue-500 underline" to="/">
                Go back
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
