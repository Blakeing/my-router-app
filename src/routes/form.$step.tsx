import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchemas } from "@/schemas/formSchemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type FormStep = 1 | 2 | 3;

const defaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
};

// Helper to get stored data with proper defaults
const getStoredData = (step: FormStep) => {
  const stored = localStorage.getItem(`form-step-${step}`);
  return {
    ...defaultValues,
    ...(stored ? JSON.parse(stored) : {}),
  };
};

// Add this helper function at the top level
const isStepComplete = (stepNumber: number) => {
  const stepData = localStorage.getItem(`form-step-${stepNumber}`);
  if (!stepData) return false;

  const schema = formSchemas[stepNumber as FormStep];
  const result = schema.safeParse(JSON.parse(stepData));
  return result.success;
};

export const Route = createFileRoute("/form/$step")({
  component: FormStep,
  validateSearch: (search: Record<string, unknown>) => {
    return search;
  },
  loader: ({ params }) => {
    const step = parseInt(params.step) as FormStep;

    // Validate step number
    if (isNaN(step) || step < 1 || step > 3) {
      throw new Error("Invalid step");
    }

    // Check previous steps are completed
    if (step > 1) {
      for (let prevStep = 1; prevStep < step; prevStep++) {
        const prevStepData = localStorage.getItem(`form-step-${prevStep}`);
        if (!prevStepData) {
          // Redirect to the earliest incomplete step
          throw redirect({
            to: "/form/$step",
            params: { step: String(prevStep) },
          });
        }

        // Validate stored data against schema
        const schema = formSchemas[prevStep as FormStep];
        const parsedData = JSON.parse(prevStepData);
        const result = schema.safeParse(parsedData);

        if (!result.success) {
          throw redirect({
            to: "/form/$step",
            params: { step: String(prevStep) },
          });
        }
      }
    }

    return { step };
  },
});

function FormStep() {
  const { step } = Route.useLoaderData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchemas[step]),
    defaultValues: getStoredData(step),
    mode: "onChange",
  });

  const hasStepErrors = (stepNumber: number) => {
    // For navigation blocking, check current step
    if (stepNumber === step) {
      return Object.keys(form.formState.errors).length > 0;
    }
    return false;
  };

  // Add new function for button styling
  const hasAnyStepErrors = () => {
    return Object.keys(form.formState.errors).length > 0;
  };

  const canNavigateToStep = (targetStep: number) => {
    // Block all navigation if any step has errors
    for (let i = 1; i <= 3; i++) {
      if (hasStepErrors(i)) return false;
    }

    // Can always go back if no errors
    if (targetStep < step) return true;

    // Can't skip steps
    if (targetStep > step + 1) return false;

    // Can go to next step if previous step is complete
    return isStepComplete(targetStep - 1);
  };

  const onNext = async () => {
    const isValid = await form.trigger();
    if (!isValid || hasStepErrors(step)) return;

    // Save form data
    localStorage.setItem(`form-step-${step}`, JSON.stringify(form.getValues()));

    if (step < 3) {
      navigate({ to: "/form/$step", params: { step: String(step + 1) } });
    } else {
      // Handle final submission
      const allData = {
        ...getStoredData(1),
        ...getStoredData(2),
        ...getStoredData(3),
      };
      console.log("Form submitted:", allData);

      // Clear storage first
      localStorage.removeItem("form-step-1");
      localStorage.removeItem("form-step-2");
      localStorage.removeItem("form-step-3");

      // Show toast and navigate
      toast({
        title: "Success!",
        description: "Form submitted successfully",
        duration: 2000,
      });

      // Reset form and navigate to first step
      form.reset(defaultValues);
      navigate({ to: "/form/$step", params: { step: "1" } });
    }
  };

  const onPrevious = () => {
    // Block navigation if there are errors
    if (hasStepErrors(step)) return;

    localStorage.setItem(`form-step-${step}`, JSON.stringify(form.getValues()));
    navigate({ to: "/form/$step", params: { step: String(step - 1) } });
  };

  // Update click handler for step indicators
  const handleStepClick = (targetStep: number) => {
    if (!canNavigateToStep(targetStep)) return;

    localStorage.setItem(`form-step-${step}`, JSON.stringify(form.getValues()));
    navigate({
      to: "/form/$step",
      params: { step: String(targetStep) },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3].map((stepNumber) => (
          <button
            key={stepNumber}
            onClick={() => handleStepClick(stepNumber)}
            disabled={!canNavigateToStep(stepNumber)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${
                hasStepErrors(stepNumber)
                  ? "bg-red-500 text-white"
                  : isStepComplete(stepNumber)
                    ? hasAnyStepErrors()
                      ? "bg-green-500 text-white opacity-50"
                      : "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                    : stepNumber === step
                      ? "bg-blue-500 text-white"
                      : canNavigateToStep(stepNumber)
                        ? "bg-gray-200 cursor-pointer hover:bg-gray-300"
                        : "bg-gray-200 cursor-not-allowed opacity-50"
              }
            `}
            type="button"
          >
            {stepNumber}
          </button>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {step === 2 && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {step === 3 && (
            <>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={step === 1 || hasStepErrors(step)}
              className={hasStepErrors(step) ? "cursor-not-allowed" : ""}
            >
              Previous
            </Button>
            <Button
              type="button"
              onClick={onNext}
              disabled={hasStepErrors(step)}
              className={hasStepErrors(step) ? "cursor-not-allowed" : ""}
            >
              {step === 3 ? "Submit" : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
