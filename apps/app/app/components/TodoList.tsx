"use client";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

const todoItems = [
  {
    id: "pending-1",
    checked: true,
    label: "Confirmar el pedido de la promo de mitad de mes.",
  },
  {
    id: "pending-2",
    checked: true,
    label: "Revisar pagos pendientes antes del cierre de hoy.",
  },
  {
    id: "pending-3",
    checked: false,
    label: "Enviar recordatorio a clientes con carrito abandonado.",
  },
  {
    id: "pending-4",
    checked: false,
    label: "Actualizar stock de las prendas mas consultadas.",
  },
  {
    id: "pending-5",
    checked: false,
    label: "Validar la lista de entregas para la tarde.",
  },
  {
    id: "pending-6",
    checked: false,
    label: "Crear una oferta especial para clientes frecuentes.",
  },
  {
    id: "pending-7",
    checked: false,
    label: "Responder mensajes nuevos del canal de Instagram.",
  },
  {
    id: "pending-8",
    checked: false,
    label: "Preparar etiquetas para los pedidos del fin de semana.",
  },
  {
    id: "pending-9",
    checked: true,
    label: "Cerrar la conciliacion de pagos del turno manana.",
  },
  {
    id: "pending-10",
    checked: true,
    label: "Compartir el resumen comercial con el equipo.",
  },
  {
    id: "pending-11",
    checked: true,
    label: "Revisar el rendimiento de los productos destacados.",
  },
  {
    id: "pending-12",
    checked: true,
    label: "Corregir precios en el catalogo de invierno.",
  },
  {
    id: "pending-13",
    checked: true,
    label: "Programar el siguiente lote de publicaciones.",
  },
] as const;

const TodoList = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h1 className="dashboard-panel-title">Pendientes</h1>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button className="w-full justify-start rounded-2xl shadow-none">
            <CalendarIcon />
            {date ? format(date, "PPP", { locale: es }) : <span>Elegí una fecha</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
            selected={date}
          />
        </PopoverContent>
      </Popover>
      <ScrollArea className="mt-4 max-h-[400px] overflow-y-auto pr-2">
        <div className="flex flex-col gap-4">
          {todoItems.map((item) => (
            <Card
              className="dashboard-item-interactive gap-0 p-4 shadow-none"
              key={item.id}
            >
              <div className="flex items-start gap-4">
                <Checkbox checked={item.checked} id={item.id} />
                <label
                  className="dashboard-subtle text-sm leading-6"
                  htmlFor={item.id}
                >
                  {item.label}
                </label>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TodoList;
