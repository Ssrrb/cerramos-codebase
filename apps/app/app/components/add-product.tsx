"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import {
  defaultProductFormValues,
  type ProductPayload,
  productCategories,
  productColors,
  productPayloadSchema,
  productSizes,
} from "@/lib/products";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Textarea } from "./ui/textarea";

interface ProductApiErrorPayload {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

const applyServerFieldErrors = (
  form: UseFormReturn<ProductPayload>,
  fieldErrors?: ProductApiErrorPayload["fieldErrors"]
) => {
  if (!fieldErrors) {
    return;
  }

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (!messages?.[0]) {
      continue;
    }

    form.setError(field as keyof ProductPayload, {
      message: messages[0],
    });
  }
};
//TODO: Enhance the form it feels overwhelmingto the user to load the products, also add states, the capcity to delete and edit.
const AddProduct = () => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProductPayload>({
    defaultValues: defaultProductFormValues,
  });
  const selectedColors = form.watch("colors");
  const images = form.watch("images");

  const toggleArrayValue = (
    fieldName: "colors" | "sizes",
    value: string,
    checked: boolean
  ) => {
    const currentValues = form.getValues(fieldName);
    const nextValues = checked
      ? [...currentValues, value]
      : currentValues.filter((currentValue) => currentValue !== value);

    form.setValue(fieldName, nextValues as never, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (fieldName === "colors" && !checked) {
      const images = { ...form.getValues("images") };
      delete images[value];
      form.setValue("images", images, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const onSubmit = (values: ProductPayload) => {
    setError(null);
    setSuccess(null);
    form.clearErrors();

    const result = productPayloadSchema.safeParse(values);

    if (!result.success) {
      applyServerFieldErrors(form, result.error.flatten().fieldErrors);
      setError("Revisa los campos del producto.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/products", {
          body: JSON.stringify(result.data),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });

        const payload = (await response.json().catch(() => null)) as
          | ProductApiErrorPayload
          | {
              id: string;
              success: true;
            }
          | null;

        if (!response.ok) {
          const errorPayload = payload as ProductApiErrorPayload | null;

          applyServerFieldErrors(form, errorPayload?.fieldErrors);
          setError(errorPayload?.error ?? "No se pudo guardar el producto.");
          return;
        }

        form.reset(defaultProductFormValues);
        setSuccess("Producto creado correctamente.");
        router.refresh();
        closeButtonRef.current?.click();
      } catch {
        setError("No se pudo guardar el producto.");
      }
    });
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Product</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the short description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the stock of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          min={1}
                          onChange={(event) =>
                            field.onChange(event.target.valueAsNumber)
                          }
                          type="number"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the price of the product in PYG.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Enter the category of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes</FormLabel>
                      <FormControl>
                        <div className="my-2 grid grid-cols-3 gap-4">
                          {productSizes.map((size) => (
                            <div className="flex items-center gap-2" key={size}>
                              <Checkbox
                                checked={field.value.includes(size)}
                                id={`size-${size}`}
                                onCheckedChange={(checked) =>
                                  toggleArrayValue(
                                    "sizes",
                                    size,
                                    Boolean(checked)
                                  )
                                }
                              />
                              <label
                                className="text-xs"
                                htmlFor={`size-${size}`}
                              >
                                {size}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the available sizes for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colors</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="my-2 grid grid-cols-3 gap-4">
                            {productColors.map((color) => (
                              <div
                                className="flex items-center gap-2"
                                key={color}
                              >
                                <Checkbox
                                  checked={field.value.includes(color)}
                                  id={`color-${color}`}
                                  onCheckedChange={(checked) =>
                                    toggleArrayValue(
                                      "colors",
                                      color,
                                      Boolean(checked)
                                    )
                                  }
                                />
                                <label
                                  className="flex items-center gap-2 text-xs"
                                  htmlFor={`color-${color}`}
                                >
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  {color}
                                </label>
                              </div>
                            ))}
                          </div>
                          {selectedColors.length > 0 ? (
                            <div className="mt-8 space-y-4">
                              <p className="font-medium text-sm">
                                Add one image path or URL for each selected
                                color:
                              </p>
                              {selectedColors.map((color) => (
                                <div className="space-y-2" key={color}>
                                  <label
                                    className="flex items-center gap-2 text-sm"
                                    htmlFor={`image-${color}`}
                                  >
                                    <div
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: color }}
                                    />
                                    {color}
                                  </label>
                                  <Input
                                    id={`image-${color}`}
                                    onChange={(event) => {
                                      form.setValue(
                                        "images",
                                        {
                                          ...form.getValues("images"),
                                          [color]: event.target.value,
                                        },
                                        {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        }
                                      );
                                    }}
                                    placeholder={`/productos/${color}.png`}
                                    value={images[color] ?? ""}
                                  />
                                  {(
                                    form.formState.errors.images as
                                      | Record<string, { message?: string }>
                                      | undefined
                                  )?.[color]?.message ? (
                                    <p className="text-destructive text-xs">
                                      {
                                        (
                                          form.formState.errors.images as
                                            | Record<
                                                string,
                                                { message?: string }
                                              >
                                            | undefined
                                        )?.[color]?.message
                                      }
                                    </p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the available colors for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error ? (
                  <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive text-sm">
                    {error}
                  </p>
                ) : null}
                {success ? (
                  <p className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-emerald-700 text-sm">
                    {success}
                  </p>
                ) : null}
                <Button disabled={isPending} type="submit">
                  {isPending ? "Saving..." : "Submit"}
                </Button>
                <SheetClose asChild>
                  <button className="hidden" ref={closeButtonRef} type="button">
                    Close
                  </button>
                </SheetClose>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
