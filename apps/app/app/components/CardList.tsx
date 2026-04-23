import Image from "next/image";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";

const popularProducts = [
  {
    id: 1,
    name: "Remera Adidas CoreFit",
    shortDescription:
      "Remera deportiva liviana para uso diario y entrenamientos.",
    description:
      "Remera deportiva liviana con calce comodo, ideal para entrenamientos y uso casual durante todo el dia.",
    price: 39.9,
    sizes: ["s", "m", "l", "xl", "xxl"],
    colors: ["gray", "purple", "green"],
    images: {
      gray: "/productos/1g.png",
      purple: "/productos/1p.png",
      green: "/productos/1gr.png",
    },
  },
  {
    id: 2,
    name: "Campera Puma Ultra Warm",
    shortDescription:
      "Campera con cierre pensada para dias frescos y salidas urbanas.",
    description:
      "Campera con interior suave y buen abrigo, ideal para sumar una capa extra sin perder comodidad.",
    price: 59.9,
    sizes: ["s", "m", "l", "xl"],
    colors: ["gray", "green"],
    images: { gray: "/productos/2g.png", green: "/productos/2gr.png" },
  },
  {
    id: 3,
    name: "Buzo Nike Air Essentials",
    shortDescription:
      "Buzo versatil con perfil deportivo para looks comodos y modernos.",
    description:
      "Buzo de tejido suave con corte relajado, pensado para acompanarte en jornadas activas o de descanso.",
    price: 69.9,
    sizes: ["s", "m", "l"],
    colors: ["green", "blue", "black"],
    images: {
      green: "/productos/3gr.png",
      blue: "/productos/3b.png",
      black: "/productos/3bl.png",
    },
  },
  {
    id: 4,
    name: "Remera Nike Dri-Flex",
    shortDescription:
      "Remera flexible de secado rapido para entrenar con mas comodidad.",
    description:
      "Remera tecnica de secado rapido que ayuda a mantener la frescura incluso en entrenamientos intensos.",
    price: 29.9,
    sizes: ["s", "m", "l"],
    colors: ["white", "pink"],
    images: { white: "/productos/4w.png", pink: "/productos/4p.png" },
  },
  {
    id: 5,
    name: "Buzo Under Armour StormFleece",
    shortDescription:
      "Buzo abrigado con terminacion deportiva para dias frios.",
    description:
      "Buzo abrigado y resistente, pensado para proteger del frio sin resignar movilidad ni estilo.",
    price: 49.9,
    sizes: ["s", "m", "l"],
    colors: ["red", "orange", "black"],
    images: {
      red: "/productos/5r.png",
      orange: "/productos/5o.png",
      black: "/productos/5bl.png",
    },
  },
];

const latestTransactions = [
  {
    id: 1,
    title: "Pago de pedido",
    badge: "John Doe",
    image:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 1400,
  },
  {
    id: 2,
    title: "Pago de pedido",
    badge: "Jane Smith",
    image:
      "https://images.pexels.com/photos/4969918/pexels-photo-4969918.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 2100,
  },
  {
    id: 3,
    title: "Pago de pedido",
    badge: "Michael Johnson",
    image:
      "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 1300,
  },
  {
    id: 4,
    title: "Pago de pedido",
    badge: "Lily Adams",
    image:
      "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 2500,
  },
  {
    id: 5,
    title: "Pago de pedido",
    badge: "Sam Brown",
    image:
      "https://images.pexels.com/photos/1680175/pexels-photo-1680175.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 1400,
  },
];

const CardList = ({ title }: { title: string }) => {
  return (
    <div>
      <h1 className="dashboard-panel-title">{title}</h1>
      <div className="flex flex-col gap-2">
        {title === "Productos"
          ? popularProducts.map((item) => (
              <Card
                className="dashboard-item flex-row items-center justify-between gap-4 p-4 shadow-none"
                key={item.id}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-sm">
                  <Image
                    alt={item.name}
                    className="object-cover"
                    fill
                    src={Object.values(item.images)[0] || ""}
                  />
                </div>
                <CardContent className="flex-1 p-0">
                  <CardTitle className="font-medium text-sm">
                    {item.name}
                  </CardTitle>
                </CardContent>
                <CardFooter className="p-0 font-medium">
                  ${item.price}K
                </CardFooter>
              </Card>
            ))
          : latestTransactions.map((item) => (
              <Card
                className="dashboard-item flex-row items-center justify-between gap-4 p-4 shadow-none"
                key={item.id}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-sm">
                  <Image
                    alt={item.title}
                    className="object-cover"
                    fill
                    src={item.image}
                  />
                </div>
                <CardContent className="flex-1 p-0">
                  <CardTitle className="font-medium text-sm">
                    {item.title}
                  </CardTitle>
                  <Badge className="mt-2" variant="secondary">
                    {item.badge}
                  </Badge>
                </CardContent>
                <CardFooter className="p-0 font-medium">
                  ${item.count / 1000}K
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default CardList;
