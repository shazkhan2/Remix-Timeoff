import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { createTimeOff } from "~/models/timeoff.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = new URLSearchParams(await request.text());
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const description = formData.get("description");

  if (!startDate || !endDate || new Date(endDate) <= new Date(startDate)) {
    return json(
      {
        errors: {
          startDate: !startDate ? "Start date is required" : undefined,
          endDate: !endDate ? "End date is required" : undefined,
          description: !description ? "Description is required" : undefined,
          dateError: new Date(endDate) <= new Date(startDate)
            ? "End date must be after start date"
            : undefined,
        },
      },
      { status: 400 }
    );
  }

  const timeOff = await createTimeOff({
    startDate,
    endDate,
    description,
    userId,
  });

  return redirect(`/timeoff/${timeOff.id}`);
};

export default function NewTimeoffPage() {
  const actionData = useActionData<typeof action>();
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.startDate) {
      startDateRef.current?.focus();
    } else if (actionData?.errors?.endDate) {
      endDateRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form method="post">
      <div>
        <label>Start Date:</label>
        <input
          ref={startDateRef}
          name="startDate"
          type="date"
          aria-invalid={actionData?.errors?.startDate ? true : undefined}
          aria-errormessage={actionData?.errors?.startDate ? "startDate-error" : undefined}
        />
        {actionData?.errors?.startDate ? (
          <div id="startDate-error">{actionData.errors.startDate}</div>
        ) : null}
      </div>

      <div>
        <label>End Date:</label>
        <input
          ref={endDateRef}
          name="endDate"
          type="date"
          aria-invalid={actionData?.errors?.endDate ? true : undefined}
          aria-errormessage={actionData?.errors?.endDate ? "endDate-error" : undefined}
        />
        {actionData?.errors?.endDate ? (
          <div id="endDate-error">{actionData.errors.endDate}</div>
        ) : null}
        {actionData?.errors?.dateError ? (
          <div id="dateError-error">{actionData.errors.dateError}</div>
        ) : null}
      </div>

      <div>
        <label>Description:</label>
        <textarea
          ref={descriptionRef}
          name="description"
          rows={4}
          aria-invalid={actionData?.errors?.description ? true : undefined}
          aria-errormessage={actionData?.errors?.description ? "description-error" : undefined}
        />
        {actionData?.errors?.description ? (
          <div id="description-error">{actionData.errors.description}</div>
        ) : null}
      </div>

      <button type="submit">Save</button>
    </Form>
  );
}
