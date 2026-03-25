import AppAreaChart from "@/app/components/AppAreaChart";
import AppBarChart from "@/app/components/AppBarChart";
import AppPieChart from "@/app/components/AppPieChart";
import CardList from "@/app/components/CardList";
import TodoList from "@/app/components/TodoList";

const Homepage = () => {
  return (
    <div className="dashboard-grid grid grid-cols-1 pb-6 lg:grid-cols-2 2xl:grid-cols-4">
      <div className="dashboard-panel lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppBarChart />
      </div>
      <div className="dashboard-panel">
        <CardList title="Movimientos" />
      </div>
      <div className="dashboard-panel">
        <AppPieChart />
      </div>
      <div className="dashboard-panel">
        <TodoList />
      </div>
      <div className="dashboard-panel lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppAreaChart />
      </div>
      <div className="dashboard-panel">
        <CardList title="Productos" />
      </div>
    </div>
  );
};

export default Homepage;
