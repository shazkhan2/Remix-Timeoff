import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { verifyTeamLogin } from "~/models/team.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const teamName = formData.get("teamName");
  const teamCode = formData.get("teamCode");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (typeof teamName !== "string" || teamName.length === 0) {
    return json(
      { errors: { teamName: "Team name is required", teamCode: null } },
      { status: 400 },
    );
  }

  if (typeof teamCode !== "string" || teamCode.length === 0) {
    return json(
      { errors: { teamName: null, teamCode: "Team code is required" } },
      { status: 400 },
    );
  }

  const team = await verifyTeamLogin(teamName, teamCode);

  if (!team) {
    return json(
      { errors: { teamName: "Invalid team name or team code", teamCode: null } },
      { status: 400 },
    );
  }

  return createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: team.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Team Login" }];

export default function TeamLoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/notes";
  const actionData = useActionData<typeof action>();
  const teamNameRef = useRef<HTMLInputElement>(null);
  const teamCodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.teamName) {
      teamNameRef.current?.focus();
    } else if (actionData?.errors?.teamCode) {
      teamCodeRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="teamName"
              className="block text-sm font-medium text-gray-700"
            >
              Team Name
            </label>
            <div className="mt-1">
              <input
                ref={teamNameRef}
                id="teamName"
                required
                autoFocus={true}
                name="teamName"
                type="text"
                aria-invalid={actionData?.errors?.teamName ? true : undefined}
                aria-describedby="teamName-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.teamName ? (
                <div className="pt-1 text-red-700" id="teamName-error">
                  {actionData.errors.teamName}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="teamCode"
              className="block text-sm font-medium text-gray-700"
            >
              Team Code
            </label>
            <div className="mt-1">
              <input
                id="teamCode"
                ref={teamCodeRef}
                name="teamCode"
                type="password"
                aria-invalid={actionData?.errors?.teamCode ? true : undefined}
                aria-describedby="teamCode-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.teamCode ? (
                <div className="pt-1 text-red-700" id="teamCode-error">
                  {actionData.errors.teamCode}
                </div>
              ) : null}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-center text-sm text-gray-500">
              Don&apos;t have a team?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
              >
                Create a Team
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
