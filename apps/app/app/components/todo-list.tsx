"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

interface TodoOrderItem {
  checked: boolean;
  createdAt: string;
  currency: string;
  customerLabel: string;
  id: string;
  orderStatus: string;
  productTitle: string;
  total: number;
}

const currencyFormatter = new Intl.NumberFormat("es-PY", {
  currency: "PYG",
  maximumFractionDigits: 0,
  style: "currency",
});

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Completado";
    case "paid":
      return "Listo para confirmar";
    case "pending_payment":
      return "Pago pendiente";
    case "new":
      return "Pendiente";
    default:
      return status;
  }
};

const formatCurrency = (amount: number, currency: string) => {
  if (currency === "PYG") {
    return currencyFormatter.format(amount);
  }

  return new Intl.NumberFormat("es-PY", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
};

const loadTodoItems = async (selectedDate: string) => {
  const response = await fetch(`/api/orders/todos?date=${selectedDate}`);
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    items?: TodoOrderItem[];
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "No se pudo cargar la lista.");
  }

  return payload?.items ?? [];
};

const updateTodoItem = async (item: TodoOrderItem, completed: boolean) => {
  const response = await fetch("/api/orders/todos", {
    body: JSON.stringify({
      completed,
      orderId: item.id,
    }),
    headers: {
      "content-type": "application/json",
    },
    method: "PATCH",
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    item?: TodoOrderItem;
  } | null;

  if (!(response.ok && payload?.item)) {
    throw new Error(payload?.error ?? "No se pudo actualizar el pedido.");
  }

  return payload.item;
};

const TodoList = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<TodoOrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  const selectedDate = useMemo(
    () =>
      date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    [date]
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextItems = await loadTodoItems(selectedDate);

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "No se pudo cargar la lista."
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const handleCheckedChange = async (item: TodoOrderItem, checked: boolean) => {
    const nextChecked = checked === true;
    const previousItems = items;

    setUpdatingIds((current) => [...current, item.id]);
    setError(null);
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              checked: nextChecked,
              orderStatus: nextChecked ? "confirmed" : "new",
            }
          : entry
      )
    );

    try {
      const nextItem = await updateTodoItem(item, nextChecked);

      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? nextItem : entry))
      );
    } catch (updateError) {
      setItems(previousItems);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar el pedido."
      );
    } finally {
      setUpdatingIds((current) => current.filter((id) => id !== item.id));
    }
  };

  return (
    <div>
      <h1 className="dashboard-panel-title">Pendientes</h1>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button className="w-full justify-start rounded-2xl shadow-none">
            <CalendarIcon />
            {date ? (
              format(date, "PPP", { locale: es })
            ) : (
              <span>Elegi una fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            onSelect={(nextDate) => {
              setDate(nextDate);
              setOpen(false);
            }}
            selected={date}
          />
        </PopoverContent>
      </Popover>
      <ScrollArea className="mt-4 max-h-[400px] overflow-y-auto pr-2">
        <div className="flex flex-col gap-4">
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {isLoading ? (
            <Card className="dashboard-item-interactive p-4 shadow-none">
              <div className="dashboard-subtle flex items-center gap-2 text-sm">
                <LoaderCircle className="size-4 animate-spin" />
                Cargando pedidos...
              </div>
            </Card>
          ) : null}
          {isLoading || items.length ? null : (
            <Card className="dashboard-item-interactive p-4 shadow-none">
              <p className="dashboard-subtle text-sm">
                No hay pedidos para la fecha seleccionada.
              </p>
            </Card>
          )}
          {isLoading
            ? null
            : items.map((item) => {
                const isUpdating = updatingIds.includes(item.id);

                return (
                  <Card
                    className="dashboard-item-interactive gap-0 p-4 shadow-none"
                    key={item.id}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={item.checked}
                        disabled={isUpdating}
                        id={item.id}
                        onCheckedChange={(checked) => {
                          handleCheckedChange(item, checked === true).catch(
                            () => undefined
                          );
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <label
                          className="font-medium text-sm leading-6"
                          htmlFor={item.id}
                        >
                          {item.productTitle}
                        </label>
                        <p className="dashboard-subtle text-sm">
                          {item.customerLabel}
                        </p>
                        <p className="dashboard-subtle text-sm">
                          {formatCurrency(item.total, item.currency)} ·{" "}
                          {getStatusLabel(item.orderStatus)} ·{" "}
                          {format(new Date(item.createdAt), "p", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TodoList;
