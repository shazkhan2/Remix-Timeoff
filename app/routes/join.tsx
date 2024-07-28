import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const first_name = formData.get("first_name");
  const last_name = formData.get("last_name");
  const daysoff = formData.get("daysoff");
  const allowed_daysoff = formData.get("allowed_daysoff");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateEmail(email)) {
    return json({ errors: { email: "Email is invalid", password: null } }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return json({ errors: { email: null, password: "Password is required" } }, { status: 400 });
  }

  if (password.length < 8) {
    return json({ errors: { email: null, password: "Password is too short" } }, { status: 400 });
  }

  if (typeof first_name !== "string" || first_name.length === 0) {
    return json({ errors: { first_name: "First name is required", password: null } }, { status: 400 });
  }

  if (typeof last_name !== "string" || last_name.length === 0) {
    return json({ errors: { last_name: "Last name is required", password: null } }, { status: 400 });
  }

  if (typeof daysoff !== "string" || daysoff.length === 0 || isNaN(Number(daysoff))) {
    return json({ errors: { daysoff: "Days off is required and must be a number", password: null } }, { status: 400 });
  }

  if (typeof allowed_daysoff !== "string" || allowed_daysoff.length === 0 || isNaN(Number(allowed_daysoff))) {
    return json({ errors: { allowed_daysoff: "Allowed days off is required and must be a number", password: null } }, { status: 400 });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json({ errors: { email: "A user already exists with this email", password: null } }, { status: 400 });
  }

  const user = await createUser(email, password, first_name, last_name, Number(daysoff), Number(allowed_daysoff));

  return createUserSession({ redirectTo, remember: false, request, userId: user.id });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="mt-1">
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                aria-invalid={actionData?.errors?.first_name ? true : undefined}
                aria-describedby="first_name-error"
              />
              {actionData?.errors?.first_name && (
                <div className="pt-1 text-red-700" id="first_name-error">
                  {actionData.errors.first_name}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="mt-1">
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                aria-invalid={actionData?.errors?.last_name ? true : undefined}
                aria-describedby="last_name-error"
              />
              {actionData?.errors?.last_name && (
                <div className="pt-1 text-red-700" id="last_name-error">
                  {actionData.errors.last_name}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="daysoff" className="block text-sm font-medium text-gray-700">
              Days Off
            </label>
            <div className="mt-1">
              <input
                id="daysoff"
                name="daysoff"
                type="number"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                aria-invalid={actionData?.errors?.daysoff ? true : undefined}
                aria-describedby="daysoff-error"
              />
              {actionData?.errors?.daysoff && (
                <div className="pt-1 text-red-700" id="daysoff-error">
                  {actionData.errors.daysoff}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="allowed_daysoff" className="block text-sm font-medium text-gray-700">
              Allowed Days Off
            </label>
            <div className="mt-1">
              <input
                id="allowed_daysoff"
                name="allowed_daysoff"
                type="number"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                aria-invalid={actionData?.errors?.allowed_daysoff ? true : undefined}
                aria-describedby="allowed_daysoff-error"
              />
              {actionData?.errors?.allowed_daysoff && (
                <div className="pt-1 text-red-700" id="allowed_daysoff-error">
                  {actionData.errors.allowed_daysoff}
                </div>
              )}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button type="submit" className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400">
            Create Account
          </button>
          <div className="flex items-center justify-center gap-2">
            <div className="text-center text-sm text-gray-500">Already have an account?</div>
            <Link className="text-center text-blue-500 underline" to={{ pathname: "/login", search: searchParams.toString() }}>
              Log in
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
